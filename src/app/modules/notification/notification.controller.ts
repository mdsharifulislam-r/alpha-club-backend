import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { NotificationService } from './notification.service';

const getMyNotifications = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await NotificationService.getMyNotifications(userId, req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Notifications retrieved successfully',
    pagination: result.pagination,
    data: result.data,
  });
});

const markAsSeen = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;
  const result = await NotificationService.markAsSeen(userId, id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Notification marked as seen',
    data: result,
  });
});

const notificationUnreadCount = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const result = await NotificationService.notificationUnreadCount(userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Unread notification count retrieved successfully',
    data: result,
  });
});

const updateNotificationCount = catchAsync(async (req: Request, res: Response) => {
  // This is a placeholder implementation. You should implement the logic here as per your application's requirements.
  const result = await NotificationService.updateNotificationCount(req?.user?.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Notification count updated successfully',
    data: result,
  });
});


const deleteNotification = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { id } = req.params;
  const result = await NotificationService.deleteNotification(userId, id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Notification deleted successfully',
    data: result,
  });
});

export const NotificationController = {
  getMyNotifications,
  markAsSeen,
  notificationUnreadCount,
  updateNotificationCount,
  deleteNotification
};