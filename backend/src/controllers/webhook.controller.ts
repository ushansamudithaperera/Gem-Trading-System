import { Request, Response } from 'express';
import { Order, OrderStatus } from '../models/Order.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { logger } from '../config/logger';
import { env } from '../config/env';

// Mock courier webhook - in production replace with real courier API
export const courierDeliveredWebhook = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { orderNumber, deliveredAt } = req.body;

  const order = await Order.findOne({ orderNumber });
  if (!order) {
    logger.warn(`Courier webhook: Order not found ${orderNumber}`);
    res.status(404).json({ error: 'Order not found' });
    return;
  }

  if (order.status !== OrderStatus.SHIPPED) {
    res.status(400).json({ error: 'Order not in shipped state' });
    return;
  }

  order.status = OrderStatus.DELIVERED;
  order.deliveryInfo.deliveredAt = new Date(deliveredAt || Date.now());
  order.deliveryInfo.autoReleaseDate = new Date(Date.now() + env.AUTO_RELEASE_DAYS * 24 * 60 * 60 * 1000);
  await order.save();

  logger.info(`Order ${orderNumber} marked as delivered, auto-release at ${order.deliveryInfo.autoReleaseDate}`);

  res.json(new ApiResponse(200, { orderNumber, status: 'DELIVERED' }, 'Delivery confirmed'));
});

// Stripe webhook (mock for now)
export const stripeWebhook = asyncHandler(async (req: Request, res: Response) => {
  // Verify signature in production
  const event = req.body;

  logger.info(`Stripe webhook received: ${event.type}`);

  if (event.type === 'payment_intent.succeeded') {
    // Update order status based on payment intent
    logger.info('Payment intent succeeded, processing...');
  }

  res.json({ received: true });
});