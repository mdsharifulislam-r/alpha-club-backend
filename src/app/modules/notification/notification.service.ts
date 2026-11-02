import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import QueryBuilder from '../../builder/QueryBuilder';
import { Notification } from './notification.mode';
import { NotificationCount } from './notificationCountModel';
import { RedisHelper } from '../../../tools/redis/redis.helper';

const MINUTE = 60;

const getMyNotifications = async (userId: string, query: Record<string, any>) => {
  const cacheKey = `notifications:${userId}`;
  const cache = await RedisHelper.redisGet(cacheKey, query);
  if (cache) {
    return cache;
  }

  const notificationQuery = new QueryBuilder(
    Notification.find({ receiver: userId },'-deleteReferenceId').populate('sender', 'name image').lean(),
    query
  )
    .paginate()
    .fields()
    .filter()
    .sort();

  const [{ data: notifications, pagination }, unreadCount] = await Promise.all([
    notificationQuery.exec(),
    Notification.countDocuments({ receiver: userId, seen: false }),
  ]);

  const result = {
    data: notifications,
    pagination,
    unreadCount,
  };
  await RedisHelper.redisSet(cacheKey, result, query, MINUTE);
  return result;
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

  await RedisHelper.bust(`notifications:${userId}:*`, `notification-count:${userId}:*`);
  return notification;
};



const notificationUnreadCount = async (userId: string) => {
  const cache = await RedisHelper.redisGet(`notification-count:${userId}`);
  if (cache) {
    return cache;
  }

  let notification = await NotificationCount.findOne({ user: userId }).lean();

  if (!notification) {
    const createdNotification = await NotificationCount.create({ user: userId, count: 0 });
    notification = createdNotification.toJSON ? createdNotification.toJSON() : createdNotification;
  }

  await RedisHelper.redisSet(`notification-count:${userId}`, notification, {}, MINUTE);
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

  await RedisHelper.bust(`notifications:${userId}:*`, `notification-count:${userId}:*`);
  return notification;
};



const deleteNotification = async (userId: string, notificationId: string) => {
  const notification = await Notification.findByIdAndDelete(notificationId);
  if (!notification) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Notification not found or access denied');
  }
  await RedisHelper.bust(`notifications:${userId}:*`, `notification-count:${userId}:*`);
  return notification;
};

export const NotificationService = {
  getMyNotifications,
  markAsSeen,
  notificationUnreadCount,
  updateNotificationCount,
  deleteNotification
};