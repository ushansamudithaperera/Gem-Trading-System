import { Request, Response } from 'express';
import { Notification } from '../models/Notification.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

export const getUserNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const { page = 1, limit = 20, unreadOnly = false } = req.query;

  const filter: any = { userId };
  if (unreadOnly === 'true') filter.read = false;

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip((+page - 1) * +limit)
    .limit(+limit);

  const total = await Notification.countDocuments(filter);

  res.json(new ApiResponse(200, { notifications, total, page, limit }, 'Notifications fetched'));
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const { notificationId } = req.params;
  const userId = req.user!._id;

  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { read: true },
    { new: true }
  );

  if (!notification) throw new ApiError(404, 'Notification not found');

  res.json(new ApiResponse(200, notification, 'Marked as read'));
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  await Notification.updateMany({ userId, read: false }, { read: true });
  res.json(new ApiResponse(200, null, 'All notifications marked as read'));
});