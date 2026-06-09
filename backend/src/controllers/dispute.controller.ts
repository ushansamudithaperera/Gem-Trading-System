import { Response } from 'express';
import { Dispute, DisputeStatus, DisputeReason } from '../models/Dispute.model';
import { Order, OrderStatus, EscrowStatus } from '../models/Order.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth.middleware';
import { logger } from '../config/logger';

/**
 * POST /api/v1/disputes
 * Open a dispute for an order (Buyer or Seller only)
 * Automatically freezes escrow status
 */
export const openDispute = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { orderId, reason, description, evidenceUrls } = req.body;
  const userId = req.user!._id;

  // Validate inputs
  if (!orderId || !reason || !description) {
    throw new ApiError(400, 'Missing required fields: orderId, reason, description');
  }

  if (!Object.values(DisputeReason).includes(reason)) {
    throw new ApiError(400, `Invalid reason. Must be one of: ${Object.values(DisputeReason).join(', ')}`);
  }

  // Fetch order
  const order = await Order.findById(orderId).populate('buyerId sellerId');
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Verify user is involved in the order (buyer or seller)
  const isBuyer = order.buyerId._id.toString() === userId.toString();
  const isSeller = order.sellerId._id.toString() === userId.toString();

  if (!isBuyer && !isSeller) {
    throw new ApiError(403, 'You are not involved in this order. Only buyer or seller can open disputes.');
  }

  // Check if dispute already exists for this order
  const existingDispute = await Dispute.findOne({
    orderId,
    status: { $in: [DisputeStatus.OPEN, DisputeStatus.UNDER_REVIEW] },
  });

  if (existingDispute) {
    throw new ApiError(400, 'An active dispute already exists for this order. Wait for resolution.');
  }

  // Order must not be already completed or closed
  if (order.status === OrderStatus.COMPLETED || order.status === OrderStatus.CANCELLED) {
    throw new ApiError(400, 'Cannot open dispute for completed or cancelled orders');
  }

  // Create dispute
  const dispute = await Dispute.create({
    orderId,
    raisedBy: userId,
    reason,
    description,
    evidenceUrls: evidenceUrls || [],
    status: DisputeStatus.OPEN,
  });

  // Freeze escrow - set order to DISPUTED status and keep escrow HELD
  order.status = OrderStatus.DISPUTED;
  order.escrowStatus = EscrowStatus.HELD; // Locked - cannot release until dispute resolved
  await order.save();

  // Populate dispute with related data
  await dispute.populate(['orderId', 'raisedBy']);

  logger.info(`Dispute opened for order ${orderId} by user ${userId}`, {
    disputeId: dispute._id,
    reason,
    raisedBy: userId,
  });

  res.status(201).json(
    new ApiResponse(201, dispute, 'Dispute opened successfully. Escrow funds are now frozen.')
  );
});

/**
 * GET /api/v1/disputes
 * Fetch disputes with role-based filtering:
 * - ADMIN: See all disputes on the platform
 * - BUYER/SELLER: See only disputes they are involved in
 */
export const getDisputes = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const userRoles = req.user!.roles;
  const { status, sortBy = 'createdAt', order = 'desc' } = req.query;

  // Build query based on role
  let query: any = {};

  if (userRoles.includes('ADMIN')) {
    // Admin sees all disputes
    // No filter on query
  } else {
    // Non-admin users see disputes they are involved in
    // Either they raised the dispute OR they are the other party in the order
    const userDisputes = await Dispute.find({ raisedBy: userId });
    const userDisputeOrderIds = userDisputes.map((d) => d.orderId);

    // Also include disputes on orders where this user is buyer or seller
    const userOrders = await Order.find({
      $or: [{ buyerId: userId }, { sellerId: userId }],
    }).select('_id');
    const userOrderIds = userOrders.map((o) => o._id);

    query.orderId = { $in: [...userDisputeOrderIds, ...userOrderIds] };
  }

  // Filter by status if provided
  if (status) {
    if (!Object.values(DisputeStatus).includes(status as any)) {
      throw new ApiError(400, `Invalid status. Must be one of: ${Object.values(DisputeStatus).join(', ')}`);
    }
    query.status = status;
  }

  // Determine sort order
  const sortValue = order === 'asc' ? 1 : -1;
  const sortObj: any = {};
  sortObj[String(sortBy)] = sortValue;

  // Fetch disputes with related data
  const disputes = await Dispute.find(query)
    .populate('orderId', 'orderNumber buyerId sellerId amount status')
    .populate('raisedBy', 'firstName lastName email')
    .sort(sortObj)
    .lean();

  // Summary info
  const summary = {
    total: disputes.length,
    byStatus: Object.values(DisputeStatus).reduce((acc: Record<string, number>, status) => {
      acc[status] = disputes.filter((d) => d.status === status).length;
      return acc;
    }, {} as Record<string, number>),
  };

  res.json(
    new ApiResponse(200, { disputes, summary }, 'Disputes fetched successfully')
  );
});

/**
 * PUT /api/v1/disputes/:id/resolve
 * ADMIN ONLY - Resolve a dispute and release/refund escrow
 */
export const resolveDispute = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Strict admin-only check
  if (!req.user!.roles.includes('ADMIN')) {
    throw new ApiError(403, 'Access denied. Only administrators can resolve disputes.');
  }

  const { id: disputeId } = req.params;
  const { resolution, decision } = req.body;

  // Validate inputs
  if (!resolution || !decision) {
    throw new ApiError(400, 'Missing required fields: resolution, decision');
  }

  if (!['BUYER', 'SELLER'].includes(decision)) {
    throw new ApiError(400, 'Decision must be either "BUYER" or "SELLER"');
  }

  // Fetch dispute
  const dispute = await Dispute.findById(disputeId).populate('orderId');
  if (!dispute) {
    throw new ApiError(404, 'Dispute not found');
  }

  // Only open or under_review disputes can be resolved
  if (
    dispute.status !== DisputeStatus.OPEN &&
    dispute.status !== DisputeStatus.UNDER_REVIEW
  ) {
    throw new ApiError(400, `Cannot resolve dispute with status: ${dispute.status}`);
  }

  // Update dispute
  dispute.status =
    decision === 'BUYER' ? DisputeStatus.RESOLVED_BUYER : DisputeStatus.RESOLVED_SELLER;
  dispute.adminResolution = resolution;
  dispute.resolvedAt = new Date();
  await dispute.save();

  // Handle order and escrow based on decision
  const order = await Order.findById(dispute.orderId);
  if (order) {
    if (decision === 'BUYER') {
      // Buyer wins: refund funds back to buyer
      order.status = OrderStatus.CANCELLED;
      order.escrowStatus = EscrowStatus.REFUNDED;

      logger.info(`Dispute resolved in favor of BUYER`, {
        disputeId,
        orderId: order._id,
        buyerId: order.buyerId,
      });
    } else {
      // Seller wins: release funds to seller
      order.status = OrderStatus.COMPLETED;
      order.escrowStatus = EscrowStatus.RELEASED;

      logger.info(`Dispute resolved in favor of SELLER`, {
        disputeId,
        orderId: order._id,
        sellerId: order.sellerId,
      });
    }
    await order.save();
  }

  // Populate dispute for response
  await dispute.populate(['orderId', 'raisedBy']);

  res.json(
    new ApiResponse(200, dispute, `Dispute resolved in favor of ${decision}. Escrow released.`)
  );
});