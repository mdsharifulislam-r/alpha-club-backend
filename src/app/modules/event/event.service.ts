import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import QueryBuilder from '../../builder/QueryBuilder';
import { IEvent } from './event.interface';
import { Event } from './event.model';
import { EventRegistration } from './eventRegistration/eventRegistration.model';

const createToDB = async (payload: IEvent) => {
  return await Event.create(payload);
};

const getAllFromDB = async (query: Record<string, any>) => {
  // By default, override any external sort with eventDate ASC (nearest future first)
  const updatedQuery = {
    ...query,
    // sortBy: 'eventDate',
    // sortOrder: 'desc',
  };

  const qb = new QueryBuilder(Event.find(), updatedQuery)
    .paginate()
    .search(['name', 'title', 'location'])
    .fields()
    .filter()
    .sort();

  // Get events and pagination
  const data = await qb.modelQuery.lean();
  const pagination = await qb.getPaginationInfo();

  // For each event, count registrations and add eventCount
  const dataWithCount = await Promise.all(
    data.map(async (event: any) => {
      const eventCount = await EventRegistration.countDocuments({ event: event._id });
      return {
        ...event,
        eventCount,
      };
    })
  );

  return {
    pagination,
    data: dataWithCount,
  };
};

const getByIdFromDB = async (id: string) => {
  const event = await Event.findById(id).lean();

  if (!event) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');
  }

  // Check registration for this event, otherwise joinStatus is 'none'
  const existingRegistration = await EventRegistration.findOne({ event: id }).lean();

  let joinStatus = existingRegistration ? existingRegistration.status || 'ongoing' : 'ongoing';

  // If eventDate is today or future, do not add enableToJoin.
  // If past, and joinStatus would be 'none', set joinStatus to "time_exceeded"
  if (event.eventDate) {
    const eventDate = new Date(event.eventDate);
    const now = new Date();
    // Only date part
    const eventYMD = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    const nowYMD = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (eventYMD < nowYMD && (!existingRegistration || joinStatus === 'ongoing')) {
      joinStatus = 'time_exceeded';
    }
  }

  return {
    ...event,
    joinStatus,
  };
};

const updateInDB = async (id: string, payload: Partial<IEvent>) => {
  const updated = await Event.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).lean();

  if (!updated) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');
  }
  return updated;
};

const deleteFromDB = async (id: string) => {
  const event = await Event.findById(id).lean();
  if (!event) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found');
  }
  const deleted = await Event.findByIdAndDelete(id).lean();
  await EventRegistration.deleteMany({ event: id });
  return deleted;
};

export const EventService = {
  createToDB,
  getAllFromDB,
  getByIdFromDB,
  updateInDB,
  deleteFromDB,
};

