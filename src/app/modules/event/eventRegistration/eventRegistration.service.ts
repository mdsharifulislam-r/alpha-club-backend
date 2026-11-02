import { StatusCodes } from 'http-status-codes';
import { IEventRegistration } from './eventRegistration.interface';
import { EventRegistration } from './eventRegistration.model';
import ApiError from '../../../../errors/ApiError';
import QueryBuilder from '../../../builder/QueryBuilder';
import { Event } from '../event.model';
import { EventRegistrationStatus } from './enventRegistration.constant';
import { USER_ROLES } from '../../../../enums/user';
import { User } from '../../user/user.model';
import { Notification } from '../../notification/notification.mode';
import { NotificationCount } from '../../notification/notificationCountModel';
import admin from '../../../../helpers/firebaseConfig';
import { RedisHelper } from '../../../../tools/redis/redis.helper';

const HOUR = 60 * 60;

const createToDB = async (payload: IEventRegistration) => {
  const { event, user } = payload;
  const [eventExists, duplicate] = await Promise.all([
    Event.findById(event).lean(),
    EventRegistration.findOne({ event, user }).select('_id').lean(),
  ]);

  if (!eventExists) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found for registration');
  }

  if (duplicate) {
    throw new ApiError(StatusCodes.CONFLICT, 'User has already registered for this event');
  }


  // Create the registration
  const registration = await EventRegistration.create(payload);
  await RedisHelper.bust('events:*', `event:${event}:*`, 'event-registrations:*');
  await EventRegistration.updateOne({ _id: registration._id }, { $set: { status: EventRegistrationStatus.PENDING } });

  // 🔔 Notification to all admins
  try {
    // Assuming you have Admin model or query to get all admins
    const admins = await User.find({ role: { $in: [USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN] } }); // Adjust as needed

    for (const admin of admins) {
      Notification.create({
        receiver: admin._id,
        title: "New Event Registration Submitted",
        message: `User registered for event: ${eventExists.title || ""}`,
        sender: user,
        refId: registration._id,
        path: "/event-registration",
        seen: false,
      }).catch(() => { });
      // 🔢 Notification count
      NotificationCount.findOneAndUpdate(
        { user: admin._id },
        { $inc: { count: 1 } },
        { new: true, upsert: true }
      ).catch(() => { });
    }
  } catch (e) {
    // Swallow notification errors
  }

  return registration;
};

const cancelEvent = async ({ event, user }: { event: string; user: string }) => {
  const registration = await EventRegistration.findOne({ event, user });

  if (!registration) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event registration not found');
  }

  if (registration.status && registration.status !== EventRegistrationStatus.PENDING) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'You are not able to to cancel it');
  }

  // Notification to all admins about cancellation (remove), and decrease count
  try {
    const admins = await (global as any).User.find({ role: { $in: ['admin', 'super_admin'] } }); // Adjust as needed

    for (const admin of admins) {
      // Remove notification for this registration
      Notification.deleteOne({
        deleteReferenceId: registration._id,
      }).catch(() => { });
      // 🔻 Decrement notification count
      NotificationCount.findOneAndUpdate(
        { user: admin._id },
        { $inc: { count: -1 } },
        { new: true }
      ).catch(() => { });
    }
  } catch (e) {
    // Ignore notification errors
  }

  await EventRegistration.deleteOne({ _id: registration._id });
  await RedisHelper.bust('events:*', `event:${event}:*`, 'event-registrations:*');

  return registration;
};


const getAllFromDB = async (query: Record<string, any>) => {
  const cache = await RedisHelper.redisGet('event-registrations', query);
  if (cache) {
    return cache;
  }

  const registrationFilter: Record<string, unknown> = {};

  if (query.searchTerm) {
    const pattern = String(query.searchTerm).replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&',
    );
    const users = await User.find({
      $or: [
        { name: { $regex: pattern, $options: 'i' } },
        { email: { $regex: pattern, $options: 'i' } },
        { phone: { $regex: pattern, $options: 'i' } },
      ],
    })
      .select('_id')
      .lean();

    registrationFilter.user = { $in: users.map(user => user._id) };
  }

  const qb = new QueryBuilder(EventRegistration.find(registrationFilter), query)
    .filter()
    .sort()
    .fields()
    .paginate();

  const { data, pagination } = await qb.exec(q => q.populate('user').lean());

  const result = {
    pagination,
    data,
  };
  await RedisHelper.redisSet('event-registrations', result, query, HOUR);
  return result;
};

const getByIdFromDB = async (id: string) => {
  const cache = await RedisHelper.redisGet(`event-registration:${id}`);
  if (cache) {
    return cache;
  }

  const registration = await EventRegistration.findById(id).lean().populate('user');

  if (!registration) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event registration not found');
  }
  await RedisHelper.redisSet(`event-registration:${id}`, registration, {}, HOUR);
  return registration;
};

const updateInDB = async (id: string, payload: Partial<IEventRegistration>) => {
  // 1️⃣ Update the registration
  const updated = await EventRegistration.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).lean();

  if (!updated) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Event registration not found");
  }

  // 2️⃣ Get the user who registered
  const existUser = await User.findById(updated.user).lean();

  if (!existUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  const receiverId = updated.user;

  // 3️⃣ Handle CONFIRMED
  if (updated.status === EventRegistrationStatus.CONFIRMED) {
    // Send FCM if token exists
    if (existUser.fcmToken) {
      admin.messaging().send({
        token: existUser.fcmToken,
        notification: {
          title: "Event Registration Confirmed",
          body: "Your event registration has been confirmed",
        },
        data: {
          receiver: String(receiverId),
          sender: "system",
          path: "/event-registration",
        },
      });
    }

    // Create notification
    await Notification.create({
      receiver: receiverId,
      title: "Event Registration Confirmed",
      message: "Your event registration has been confirmed",
      refId: updated._id,
      sender: null,
      path: "/event-registration",
      seen: false,
    });

    // Increment notification count
    await NotificationCount.findOneAndUpdate(
      { user: receiverId },
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    );
  }

  // 4️⃣ Handle CANCELLED
  else if (updated.status === EventRegistrationStatus.CANCELLED) {
    // Send FCM if token exists
    if (existUser.fcmToken) {
      admin.messaging().send({
        token: existUser.fcmToken,
        notification: {
          title: "Event Registration Cancelled",
          body: "Your event registration has been cancelled",
        },
        data: {
          receiver: String(receiverId),
          sender: "system",
          path: "/event-registration",
        },
      });
    }

    // Create notification
    await Notification.create({
      receiver: receiverId,
      title: "Event Registration Cancelled",
      message: "Your event registration has been cancelled",
      refId: updated._id,
      sender: null,
      path: "/event-registration",
      seen: false,
    });

    // Decrement notification count
    await NotificationCount.findOneAndUpdate(
      { user: receiverId },
      { $inc: { count: -1 } },
      { new: true, upsert: true }
    );
  }

  await RedisHelper.bust(
    'events:*',
    'event-registrations:*',
    `event-registration:${id}:*`,
    updated.event ? `event:${updated.event}:*` : 'events:*',
  );
  return updated;
};

const deleteFromDB = async (id: string) => {
  const registration = await EventRegistration.findById(id).lean();
  if (!registration) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event registration not found');
  }
  const deleted = await EventRegistration.findByIdAndDelete(id).lean();
  await RedisHelper.bust(
    'events:*',
    'event-registrations:*',
    `event-registration:${id}:*`,
    registration.event ? `event:${registration.event}:*` : 'events:*',
  );
  return deleted;
};

export const EventRegistrationService = {
  createToDB,
  getAllFromDB,
  getByIdFromDB,
  updateInDB,
  deleteFromDB,
  cancelEvent
};
