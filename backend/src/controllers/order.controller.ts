import { Request, Response } from 'express';
import { Order, OrderStatus, EscrowStatus } from '../models/Order.model';
import { User } from '../models/User.model';
import { Gem, GemStatus } from '../models/Gem.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { PaymentService } from '../services/payment.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { env } from '../config/env';

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

/**
 * Seller updates tracking info for an order
 * PUT /api/v1/orders/:id/tracking
 * Only the seller can update tracking info
 */
export const updateTrackingInfo = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id: orderId } = req.params;
    const { courierCompany, trackingNumber, status } = req.body;
    const userId = req.user!._id;

    // Validate input
    if (!courierCompany || !trackingNumber) {
      throw new ApiError(400, 'courierCompany and trackingNumber are required');
    }

    if (status && !['pending', 'in_transit', 'delivered', 'failed'].includes(status)) {
      throw new ApiError(400, 'Invalid tracking status');
    }

    const order = await Order.findById(orderId);
    if (!order) throw new ApiError(404, 'Order not found');

    // Only seller or admin can update tracking
    const isSeller = order.sellerId.toString() === userId.toString();
    const isAdmin = req.user!.roles.includes('ADMIN');

    if (!isSeller && !isAdmin) {
      throw new ApiError(
        403,
        'Only the seller can update tracking information for this order'
      );
    }

    // Can only update tracking if order is in PENDING_DISPATCH status
    if (order.status !== OrderStatus.PENDING_DISPATCH) {
      throw new ApiError(
        400,
        `Cannot update tracking for order in status: ${order.status}`
      );
    }

    // Update tracking info
    order.deliveryInfo = {
      ...order.deliveryInfo,
      courierCompany,
      trackingNumber,
      status: status || 'in_transit',
      shippedAt: new Date(),
    };

    // Update order status to SHIPPED
    order.status = OrderStatus.SHIPPED;

    // Calculate auto-release date (default 3 days from shipping)
    const autoReleaseDate = new Date();
    autoReleaseDate.setDate(autoReleaseDate.getDate() + env.AUTO_RELEASE_DAYS);
    order.deliveryInfo.autoReleaseDate = autoReleaseDate;

    await order.save();

    res.json(
      new ApiResponse(
        200,
        order,
        `Tracking information updated. Auto-release scheduled for ${autoReleaseDate.toISOString()}`
      )
    );
  }
);

/**
 * Buyer confirms delivery and releases escrow funds to seller
 * PUT /api/v1/orders/:id/release-escrow
 * Only the buyer can release escrow
 */
export const releaseEscrow = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id: orderId } = req.params;
    const userId = req.user!._id;

    const order = await Order.findById(orderId).populate('sellerId');
    if (!order) throw new ApiError(404, 'Order not found');

    // Only buyer or admin can release escrow
    const isBuyer = order.buyerId.toString() === userId.toString();
    const isAdmin = req.user!.roles.includes('ADMIN');

    if (!isBuyer && !isAdmin) {
      throw new ApiError(403, 'Only the buyer can release escrow for this order');
    }

    // Can only release if order is SHIPPED and escrow is HELD
    if (order.status !== OrderStatus.SHIPPED) {
      throw new ApiError(400, `Cannot release escrow for order in status: ${order.status}`);
    }

    if (order.escrowStatus !== EscrowStatus.HELD) {
      throw new ApiError(
        400,
        `Escrow is already in status: ${order.escrowStatus}. Cannot release again.`
      );
    }

    // Get seller details to access Stripe Connect account
    const seller = await User.findById(order.sellerId);
    if (!seller) throw new ApiError(404, 'Seller not found');

    // Check if seller has Stripe Connect account
    if (!seller.stripeConnectAccountId) {
      throw new ApiError(
        400,
        'Seller has not set up payment account. Please contact support.'
      );
    }

    try {
      // Capture the payment (release funds from escrow)
      if (order.stripePaymentIntentId) {
        const captureSuccess = await PaymentService.capturePaymentIntent(
          order.stripePaymentIntentId,
          order.amount
        );

        if (!captureSuccess) {
          throw new ApiError(500, 'Failed to capture payment');
        }
      }

      // Transfer seller amount to seller's Stripe Connect account
      // Note: Platform fee (adminFee) is already retained in platform account
      const transferId = await PaymentService.transferToSellerAccount(
        seller.stripeConnectAccountId,
        order.sellerAmount,
        'usd',
        {
          orderId: order._id.toString(),
          orderNumber: order.orderNumber,
          buyerId: order.buyerId.toString(),
          sellerId: order.sellerId.toString(),
        }
      );

      // Update order status
      order.escrowStatus = EscrowStatus.RELEASED;
      order.status = OrderStatus.DELIVERED;
      order.deliveryInfo = {
        ...order.deliveryInfo,
        deliveredAt: new Date(),
        autoReleaseDate: undefined, // Clear the auto-release date
      };

      await order.save();

      // Update seller's transaction count
      seller.totalTransactions += 1;
      await seller.save();

      // Update buyer's transaction count
      const buyer = await User.findById(order.buyerId);
      if (buyer) {
        buyer.totalTransactions += 1;
        await buyer.save();
      }

      res.json(
        new ApiResponse(
          200,
          {
            order,
            transferId,
            message: 'Escrow released successfully',
          },
          `Funds (${order.sellerAmount}) transferred to seller account`
        )
      );
    } catch (error: any) {
      throw new ApiError(
        500,
        error.message || 'Failed to release escrow and transfer funds'
      );
    }
  }
);