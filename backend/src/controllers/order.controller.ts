import { Request, Response } from 'express';
import { Order, OrderStatus } from '../models/Order.model';
import { Gem, GemStatus } from '../models/Gem.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const { gemId, amount } = req.body;
  const buyerId = req.user!._id;

  const gem = await Gem.findById(gemId);
  if (!gem || gem.status !== GemStatus.AVAILABLE) throw new ApiError(400, 'Gem not available');

  const adminFee = amount * 0.05;
  const sellerAmount = amount - adminFee;

  const order = await Order.create({
    buyerId,
    sellerId: gem.sellerId,
    gemId,
    amount,
    adminFee,
    sellerAmount,
    status: OrderStatus.PENDING_DISPATCH,
  });

  gem.status = GemStatus.SOLD;
  await gem.save();

  res.status(201).json(new ApiResponse(201, order, 'Order created, payment pending escrow'));
});

export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const userId = req.user!._id;

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, 'Order not found');

  if (order.buyerId.toString() !== userId.toString() && !req.user!.roles.includes('ADMIN')) {
    throw new ApiError(403, 'Not authorized');
  }

  if (order.status !== OrderStatus.PENDING_DISPATCH) {
    throw new ApiError(400, `Cannot cancel order in status: ${order.status}`);
  }

  order.status = OrderStatus.CANCELLED;
  await order.save();

  const gem = await Gem.findById(order.gemId);
  if (gem) gem.status = GemStatus.AVAILABLE;
  await gem?.save();

  res.json(new ApiResponse(200, order, 'Order cancelled, refund will be processed'));
});

export const getUserOrders = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!._id;
  const orders = await Order.find({ $or: [{ buyerId: userId }, { sellerId: userId }] })
    .populate('gemId')
    .sort({ createdAt: -1 });
  res.json(new ApiResponse(200, orders, 'Orders fetched'));
});