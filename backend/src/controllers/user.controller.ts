import { Request, Response } from 'express';
import { User } from '../models/User.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!._id).select('-password');
  if (!user) throw new ApiError(404, 'User not found');
  res.json(new ApiResponse(200, user, 'Profile retrieved'));
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const allowedUpdates = ['firstName', 'lastName', 'phone', 'avatar', 'address', 'businessName'];
  const updates = Object.keys(req.body)
    .filter(key => allowedUpdates.includes(key))
    .reduce((obj, key) => ({ ...obj, [key]: req.body[key] }), {});

  const user = await User.findByIdAndUpdate(req.user!._id, updates, { new: true }).select('-password');
  if (!user) throw new ApiError(404, 'User not found');
  res.json(new ApiResponse(200, user, 'Profile updated'));
});

export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user!.roles.includes('ADMIN')) throw new ApiError(403, 'Admin only');
  const users = await User.find().select('-password').limit(100);
  res.json(new ApiResponse(200, users, 'Users fetched'));
});