import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { Notification } from './notification.mode';
import { NotificationCount } from './notificationCountModel';

const getMyNotifications = async (userId: string, query: Record<string, any>) => {
  const notificationQuery = new QueryBuilder(
    Notification.find({ receiver: userId },'-deleteReferenceId').populate('sender', 'name image').lean(),
    query
  )
    .paginate()
    .fields()
    .filter()
    .sort();

  const notifications = await notificationQuery.modelQuery;

  const unreadCount = await Notification.countDocuments({ recipient: userId, seen: false });

  const pagination = await notificationQuery.getPaginationInfo();

  return {
    data: notifications,
    pagination,
    unreadCount,
  };
};

const markAsSeen = async (userId: string, notificationId: string) => {
  const notification = await Notification.findByIdAndUpdate(
    notificationId,
    { seen: true },
    { new: true }
  ).lean();

  if (!notification) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Notification not found or access denied');
  }
  

  return notification;
};



const notificationUnreadCount = async (userId: string) => {
  let notification = await NotificationCount.findOne({ user: userId }).lean();

  if (!notification) {
    const createdNotification = await NotificationCount.create({ user: userId, count: 0 });
    notification = createdNotification.toJSON ? createdNotification.toJSON() : createdNotification;
  }

  return notification;
};

const updateNotificationCount = async (userId: string) => {
  const notification = await NotificationCount.findOneAndUpdate(
    { user: userId },
    { count: 0 },
    { new: true }
  )
  if (!notification) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Notification not found or access denied');
  }

  return notification;
};



const deleteNotification = async (userId: string, notificationId: string) => {
  const notification = await Notification.findByIdAndDelete(notificationId);
  if (!notification) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Notification not found or access denied');
  }
  return notification;
};

export const NotificationService = {
  getMyNotifications,
  markAsSeen,
  notificationUnreadCount,
  updateNotificationCount,
  deleteNotification
};