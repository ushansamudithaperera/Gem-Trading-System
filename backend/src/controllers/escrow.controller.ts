import { Request, Response } from 'express';
import { Order, EscrowStatus, OrderStatus } from '../models/Order.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';

export const releaseEscrow = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const userId = req.user!._id;

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, 'Order not found');

  // Only buyer can confirm receipt
  if (order.buyerId.toString() !== userId.toString()) {
    throw new ApiError(403, 'Only buyer can release escrow');
  }

  if (order.status !== OrderStatus.DELIVERED) {
    throw new ApiError(400, 'Order not delivered yet');
  }

  if (order.escrowStatus !== EscrowStatus.HELD) {
    throw new ApiError(400, 'Escrow already released or refunded');
  }

  order.escrowStatus = EscrowStatus.RELEASED;
  order.status = OrderStatus.COMPLETED;
  await order.save();

  // TODO: Call Stripe API to transfer funds to seller/cutter
  logger.info(`Escrow released for order ${orderId}`);

  res.json(new ApiResponse(200, order, 'Escrow released, payment transferred'));
});

export const refundEscrow = asyncHandler(async (req: Request, res: Response) => {
  const { orderId } = req.params;
  const { reason } = req.body;
  const userId = req.user!._id;

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, 'Order not found');

  // Admin or buyer can request refund in certain cases
  const isAdmin = req.user!.roles.includes('ADMIN');
  if (order.buyerId.toString() !== userId.toString() && !isAdmin) {
    throw new ApiError(403, 'Not authorized');
  }

  if (order.escrowStatus !== EscrowStatus.HELD) {
    throw new ApiError(400, 'Escrow not held');
  }

  order.escrowStatus = EscrowStatus.REFUNDED;
  order.status = OrderStatus.CANCELLED;
  order.cancellationReason = reason;
  await order.save();

  logger.info(`Escrow refunded for order ${orderId}, reason: ${reason}`);

  res.json(new ApiResponse(200, order, 'Escrow refunded'));
});