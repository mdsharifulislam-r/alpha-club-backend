import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { aggregateById, aggregatePage } from '../../builder/aggregatePage';
import QueryBuilder from '../../builder/QueryBuilder';
import { PipelineStage } from 'mongoose';
import { IEvent } from './event.interface';
import { Event } from './event.model';
import { EventRegistration } from './eventRegistration/eventRegistration.model';
import { RedisHelper } from '../../../tools/redis/redis.helper';

const EVENT_TTL = 10 * 60;

const createToDB = async (payload: IEvent) => {
  const event = await Event.create(payload);
  await RedisHelper.bust('events:*', 'partner-overview:*', 'statistics:*');
  return event;
};

// const getAllFromDB = async (query: Record<string, any>) => {
//   // By default, override any external sort with eventDate ASC (nearest future first)
//   const updatedQuery = {
//     ...query,
//     // sortBy: 'eventDate',
//     // sortOrder: 'desc',
//   };

//   const qb = new QueryBuilder(Event.find(), updatedQuery)
//     .paginate()
//     .search(['name', 'title', 'location'])
//     .fields()
//     .filter()
//     .sort();

//   // Get events and pagination
//   const data = await qb.modelQuery.lean();
//   const pagination = await qb.getPaginationInfo();

//   // For each event, count registrations and add eventCount
//   const dataWithCount = await Promise.all(
//     data.map(async (event: any) => {
//       const eventCount = await EventRegistration.countDocuments({ event: event._id });
//       return {
//         ...event,
//         eventCount,
//       };
//     })
//   );

//   return {
//     pagination,
//     data: dataWithCount,
//   };
// };
const registrationCollection = () => EventRegistration.collection.collectionName;

const castUserId = (userId: string) =>
  (EventRegistration.find({ user: userId }).cast(EventRegistration) as { user: unknown }).user;

const withTimeExceeded = (
  eventDate: Date | string | undefined,
  joinStatus: string | undefined,
  hasRegistration: boolean,
) => {
  if (!eventDate) return joinStatus;

  const parsed = new Date(eventDate);
  const now = new Date();
  const eventYMD = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  const nowYMD = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (eventYMD < nowYMD && (!hasRegistration || joinStatus === 'ongoing')) {
    return 'time_exceeded';
  }

  return joinStatus;
};

const registrationLookup = (matchUser?: unknown): PipelineStage => ({
  $lookup: {
    from: registrationCollection(),
    let: { eventId: '$_id' },
    pipeline: [
      {
        $match: {
          $expr: matchUser === undefined
            ? { $eq: ['$event', '$$eventId'] }
            : {
                $and: [
                  { $eq: ['$event', '$$eventId'] },
                  { $eq: ['$user', matchUser] },
                ],
              },
        },
      },
      { $limit: 1 },
      { $project: { status: 1 } },
    ],
    as: 'myRegistration',
  },
});

const getAllFromDB = async (query: Record<string, any>, userId: string) => {
  const cacheKey = `events:${userId}`;
  const cache = await RedisHelper.redisGet(cacheKey, query);
  if (cache) {
    return cache;
  }

  const qb = new QueryBuilder(Event.find(), query)
    .search(['name', 'title', 'location'])
    .filter(['status'])
    .sort()
    .fields()
    .paginate();

  const stages: PipelineStage[] = [
    {
      $lookup: {
        from: registrationCollection(),
        let: { eventId: '$_id' },
        pipeline: [
          { $match: { $expr: { $eq: ['$event', '$$eventId'] } } },
          { $count: 'count' },
        ],
        as: 'eventCountBucket',
      },
    },
    registrationLookup(castUserId(userId)),
    {
      $addFields: {
        eventCount: {
          $ifNull: [{ $arrayElemAt: ['$eventCountBucket.count', 0] }, 0],
        },
        registered: { $gt: [{ $size: '$myRegistration' }, 0] },
        registrationStatus: { $arrayElemAt: ['$myRegistration.status', 0] },
      },
    },
    { $unset: ['eventCountBucket', 'myRegistration'] },
  ];

  const { data, pagination } = await aggregatePage(Event, qb, stages, [
    'eventCount',
    'registered',
    'registrationStatus',
  ]);

  const dataWithExtra = data.map((event: any) => {
    const hasRegistration = Boolean(event.registered);
    let joinStatus: string | undefined = hasRegistration
      ? event.registrationStatus == null
        ? undefined
        : event.registrationStatus
      : 'ongoing';
    joinStatus = withTimeExceeded(event.eventDate, joinStatus, hasRegistration);

    const { registered, registrationStatus, eventCount, ...rest } = event;
    return {
      ...rest,
      eventCount: eventCount || 0,
      joinStatus,
    };
  });

  const result = {
    pagination,
    data: dataWithExtra,
  };
  await RedisHelper.redisSet(cacheKey, result, query, EVENT_TTL);
  return result;
};
const getByIdFromDB = async (id: string) => {
  const cache = await RedisHelper.redisGet(`event:${id}`);
  if (cache) {
    return cache;
  }

  const event = await aggregateById(Event, id, [
    registrationLookup(),
    {
      $addFields: {
        registered: { $gt: [{ $size: '$myRegistration' }, 0] },
        registrationStatus: { $arrayElemAt: ['$myRegistration.status', 0] },
      },
    },
    { $unset: 'myRegistration' },
  ]);

  if (!event) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');
  }

  const hasRegistration = Boolean(event.registered);
  let joinStatus = hasRegistration
    ? event.registrationStatus || 'ongoing'
    : 'ongoing';
  joinStatus = withTimeExceeded(event.eventDate, joinStatus, hasRegistration);

  delete event.registered;
  delete event.registrationStatus;

  const result = {
    ...event,
    joinStatus,
  };
  await RedisHelper.redisSet(`event:${id}`, result, {}, EVENT_TTL);
  return result;
};

const updateInDB = async (id: string, payload: Partial<IEvent>) => {
  const updated = await Event.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).lean();

  if (!updated) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');
  }
  await RedisHelper.bust('events:*', `event:${id}:*`, 'partner-overview:*');
  return updated;
};

const deleteFromDB = async (id: string) => {
  const deleted = await Event.findByIdAndDelete(id).lean();
  if (!deleted) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');
  }
  await EventRegistration.deleteMany({ event: id });
  await RedisHelper.bust(
    'events:*',
    `event:${id}:*`,
    'event-registrations:*',
    'partner-overview:*',
    'statistics:*',
  );
  return deleted;
};

export const EventService = {
  createToDB,
  getAllFromDB,
  getByIdFromDB,
  updateInDB,
  deleteFromDB,
};

