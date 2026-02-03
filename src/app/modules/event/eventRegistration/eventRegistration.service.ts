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

const createToDB = async (payload: IEventRegistration) => {
  // Check if event exists
  const { event, user } = payload;
  const eventExists = await Event.findById(event).lean();
  if (!eventExists) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event not found for registration');
  }

  // Check for duplicate registration (same user for same event)
  const duplicate = await EventRegistration.findOne({ event, user }).lean();
  if (duplicate) {
    throw new ApiError(StatusCodes.CONFLICT, 'User has already registered for this event');
  }

  // Create the registration
  const registration = await EventRegistration.create(payload);

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

  return registration;
};


const getAllFromDB = async (query: Record<string, any>) => {
  const updatedQuery = {
    ...query,
  };

  const searchableFields = []; // No direct searchable fields here; see below.

  const qb = new QueryBuilder(
    EventRegistration.find(),
    updatedQuery
  )
    .paginate()
    .fields()
    .filter()
    .sort();

  // Get registrations, then populate user (manually, since QueryBuilder doesn't support deep search)
  let data = await qb.modelQuery.populate('user').lean();
  const pagination = await qb.getPaginationInfo();

  // If searchTerm is present, filter the populated user fields manually in-memory
  if (updatedQuery.searchTerm) {
    const searchTerm = (updatedQuery.searchTerm as string).toLowerCase();
    data = data.filter((doc: any) => {
      const user = doc.user || {};
      return (
        (user.name && user.name.toLowerCase().includes(searchTerm)) ||
        (user.email && user.email.toLowerCase().includes(searchTerm)) ||
        (user.phone && user.phone.toLowerCase().includes(searchTerm))
      );
    });
  }

  return {
    pagination,
    data,
  };
};

const getByIdFromDB = async (id: string) => {
  const registration = await EventRegistration.findById(id).lean().populate('user');

  if (!registration) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event registration not found');
  }
  return registration;
};

const updateInDB = async (id: string, payload: Partial<IEventRegistration>) => {
  const updated = await EventRegistration.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).lean();

  const existUser = await User.findOne({ _id: payload.user });

  if (updated?.status === EventRegistrationStatus.CONFIRMED) {

    if (existUser?.fcmToken) {
      admin.messaging().send({
        token: existUser.fcmToken!,
        notification: {
          title: 'Event Registration Confirmed',
          body: 'Your event registration has been confirmed',
        },
        data: {
          receiver: String(payload.user),
          sender: 'system',
          path: '/event-registration',
        },
      })
    }
    Notification.create({
      receiver: payload.user,
      title: 'Event Registration Confirmed',
      message: 'Your event registration has been confirmed',
      refId: updated._id,
      sender: null,
      path: '/event-registration',
      seen: false,
    });

    NotificationCount.findOneAndUpdate(
      { user: payload.user },
      { $inc: { count: 1 } },
      { new: true, upsert: true }
    );
  } else if (updated?.status === EventRegistrationStatus.CANCELLED) {

    if (existUser?.fcmToken) {
      admin.messaging().send({
        token: existUser.fcmToken!,
        notification: {
          title: 'Event Registration Cancelled',
          body: 'Your event registration has been cancelled',
        },
        data: {
          receiver: String(payload.user),
          sender: 'system',
          path: '/event-registration',
        },
      })
    }
    Notification.create({
      receiver: payload.user,
      title: 'Event Registration Cancelled',
      message: 'Your event registration has been cancelled',
      refId: updated._id,
      sender: null,
      path: '/event-registration',
      seen: false,
    });

    Notification.deleteOne({
      deleteReferenceId: updated._id,
    });
    NotificationCount.findOneAndUpdate(
      { user: updated.user },
      { $inc: { count: -1 } },
      { new: true, upsert: true }
    );
  }

  if (!updated) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event registration not found');
  }
  return updated;
};

const deleteFromDB = async (id: string) => {
  const registration = await EventRegistration.findById(id).lean();
  if (!registration) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Event registration not found');
  }
  const deleted = await EventRegistration.findByIdAndDelete(id).lean();
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
