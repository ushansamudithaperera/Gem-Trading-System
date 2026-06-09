import { Response } from 'express';
import { Order } from '../models/Order.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * GET /api/admin/orders
 * Fetch all platform orders (marketplace sales and cutting jobs) for monitoring.
 */
export const getAllSystemOrders = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .populate('buyerId', 'firstName lastName email phone companyName businessName')
    .populate('sellerId', 'firstName lastName email phone companyName businessName')
    .populate('cutterId', 'firstName lastName email phone companyName businessName')
    .populate('gemId', 'title price images type status weightCarats')
    .lean();

  res.json(new ApiResponse(200, orders, 'All system orders retrieved successfully'));
});
