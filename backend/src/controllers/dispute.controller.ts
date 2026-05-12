import { Request, Response } from 'express';
import { Dispute, DisputeStatus } from '../models/Dispute.model';
import { Order, OrderStatus } from '../models/Order.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { logger } from '../config/logger';

export const openDispute = asyncHandler(async (req: Request, res: Response) => {
  const { orderId, reason, description, evidenceImages } = req.body;
  const userId = req.user!._id;

  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, 'Order not found');

  if (order.buyerId.toString() !== userId.toString() && order.sellerId.toString() !== userId.toString()) {
    throw new ApiError(403, 'Not involved in this order');
  }

  const existingDispute = await Dispute.findOne({ orderId, status: { $ne: DisputeStatus.CLOSED } });
  if (existingDispute) throw new ApiError(400, 'Dispute already open');

  const dispute = await Dispute.create({
    orderId,
    raisedBy: userId,
    reason,
    description,
    evidenceImages,
    status: DisputeStatus.OPEN,
  });

  order.status = OrderStatus.DISPUTED;
  await order.save();

  logger.info(`Dispute opened for order ${orderId} by user ${userId}`);

  res.status(201).json(new ApiResponse(201, dispute, 'Dispute opened, escrow frozen'));
});

export const resolveDispute = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user!.roles.includes('ADMIN')) throw new ApiError(403, 'Admin only');

  const { disputeId } = req.params;
  const { resolution, decision } = req.body; // decision: 'BUYER' or 'SELLER'

  const dispute = await Dispute.findById(disputeId);
  if (!dispute) throw new ApiError(404, 'Dispute not found');

  dispute.status = decision === 'BUYER' ? DisputeStatus.RESOLVED_BUYER : DisputeStatus.RESOLVED_SELLER;
  dispute.adminResolution = resolution;
  dispute.resolvedAt = new Date();
  await dispute.save();

  const order = await Order.findById(dispute.orderId);
  if (order) {
    if (decision === 'BUYER') {
      // Refund buyer
      order.status = OrderStatus.CANCELLED;
    } else {
      // Release to seller
      order.status = OrderStatus.COMPLETED;
    }
    await order.save();
  }

  res.json(new ApiResponse(200, dispute, 'Dispute resolved'));
});