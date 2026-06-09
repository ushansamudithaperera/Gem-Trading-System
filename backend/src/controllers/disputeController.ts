import { Response } from 'express';
import { Dispute } from '../models/Dispute.model';
import { Order, OrderStatus, EscrowStatus } from '../models/Order.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth.middleware';
import { logger } from '../config/logger';

/**
 * POST /api/disputes
 * Create a new dispute for an order.
 * Accessible to authenticated Buyers, Sellers, and Cutters.
 */
export const createDispute = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { orderId, reason, description, evidenceUrls } = req.body;

  if (!orderId || !reason || !description) {
    throw new ApiError(400, 'Order ID, reason, and description are required');
  }

  const order = await Order.findById(orderId);
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  // Determine who the dispute is against
  let against;
  const isBuyer = userId.toString() === order.buyerId.toString();
  const isSeller = userId.toString() === order.sellerId.toString();
  const isCutter = order.cutterId && userId.toString() === order.cutterId.toString();

  if (!isBuyer && !isSeller && !isCutter) {
    throw new ApiError(403, 'You are not authorized to raise a dispute for this order');
  }

  if (isBuyer) {
    against = order.cutterId || order.sellerId;
  } else {
    against = order.buyerId;
  }

  // Check if a dispute already exists for this order
  const existingDispute = await Dispute.findOne({ orderId, status: { $ne: 'Closed' } });
  if (existingDispute) {
    throw new ApiError(400, 'An active dispute already exists for this order');
  }

  const dispute = await Dispute.create({
    orderId,
    raisedBy: userId,
    against,
    reason,
    description,
    evidenceUrls: evidenceUrls || [],
    status: 'Open',
  });

  // Mark the related order as DISPUTED to block immediate escrow release
  order.status = OrderStatus.DISPUTED;
  await order.save();

  logger.info(`Dispute ${dispute._id} raised by user ${userId} against ${against} for order ${orderId}`);

  res.status(201).json(new ApiResponse(201, dispute, 'Dispute raised successfully. Escrow funds held.'));
});

/**
 * GET /api/disputes/my-disputes
 * Fetch disputes involving the authenticated user.
 */
export const getMyDisputes = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  const disputes = await Dispute.find({
    $or: [{ raisedBy: userId }, { against: userId }],
  })
    .sort({ createdAt: -1 })
    .populate('orderId', 'orderNumber amount status escrowStatus')
    .populate('raisedBy', 'firstName lastName email')
    .populate('against', 'firstName lastName email')
    .lean();

  res.json(new ApiResponse(200, disputes, 'User disputes retrieved successfully'));
});

/**
 * GET /api/disputes/all
 * Fetch all disputes in the platform (Admin only).
 */
export const getAllDisputes = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const disputes = await Dispute.find()
    .sort({ createdAt: -1 })
    .populate('orderId', 'orderNumber amount status escrowStatus')
    .populate('raisedBy', 'firstName lastName email')
    .populate('against', 'firstName lastName email')
    .lean();

  res.json(new ApiResponse(200, disputes, 'All system disputes retrieved successfully'));
});

/**
 * PATCH /api/disputes/:id/resolve
 * Resolve an active dispute and decide escrow action (Admin only).
 */
export const resolveDispute = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { decision, resolutionAction } = req.body;

  if (!decision || !resolutionAction) {
    throw new ApiError(400, 'Decision text and resolution action are required');
  }

  if (!['REFUND_BUYER', 'PAY_SELLER'].includes(resolutionAction)) {
    throw new ApiError(400, "Resolution action must be 'REFUND_BUYER' or 'PAY_SELLER'");
  }

  const dispute = await Dispute.findById(id);
  if (!dispute) {
    throw new ApiError(404, 'Dispute not found');
  }

  if (dispute.status === 'Resolved') {
    throw new ApiError(400, 'Dispute is already resolved');
  }

  const order = await Order.findById(dispute.orderId);
  if (!order) {
    throw new ApiError(404, 'Associated order not found');
  }

  // Update Dispute fields
  dispute.status = 'Resolved';
  dispute.adminDecision = decision;
  dispute.adminResolution = decision;
  dispute.resolvedBy = req.user?._id;
  dispute.resolvedAt = new Date();

  // Apply Escrow Actions based on Admin Resolution
  if (resolutionAction === 'REFUND_BUYER') {
    order.escrowStatus = EscrowStatus.REFUNDED;
    order.status = OrderStatus.CANCELLED;
  } else if (resolutionAction === 'PAY_SELLER') {
    order.escrowStatus = EscrowStatus.RELEASED;
    order.status = OrderStatus.COMPLETED;
  }

  await dispute.save();
  await order.save();

  logger.info(`Dispute ${id} resolved by admin ${req.user?._id}. Action: ${resolutionAction}`);

  res.json(new ApiResponse(200, { dispute, order }, 'Dispute resolved and escrow processed successfully'));
});
