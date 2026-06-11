import { Response } from 'express';
import Stripe from 'stripe';
import { env } from '../config/env';
import { Order, OrderStatus, EscrowStatus } from '../models/Order.model';
import { CuttingJob, CuttingStatus, JobStatus } from '../models/CuttingJob.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth.middleware';
import { logger } from '../config/logger';

// Initialize Stripe using STRIPE_SECRET_KEY from process.env or configuration
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || env.STRIPE_SECRET_KEY;
const stripe = new Stripe(stripeSecretKey || '', {
  apiVersion: '2023-08-16' as any,
});

if (stripeSecretKey) {
  logger.info('Stripe initialized successfully in PaymentController');
} else {
  logger.warn('Stripe key is missing; Stripe payments will fail');
}

/**
 * POST /api/v1/payments/create-intent
 * Creates a Stripe PaymentIntent for the specified amount and order/job reference.
 */
export const createPaymentIntent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { amount, orderId, jobId } = req.body;

  if (amount === undefined || typeof amount !== 'number' || amount <= 0) {
    throw new ApiError(400, 'Invalid amount. Amount must be a positive number.');
  }

  if (!orderId && !jobId) {
    throw new ApiError(400, 'Either orderId or jobId must be provided to create a payment intent.');
  }

  // Stripe expects the amount in the smallest currency unit.
  // For LKR, Stripe expects the amount to be multiplied by 100.
  const stripeAmount = Math.round(amount * 100);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: stripeAmount,
      currency: 'lkr',
      metadata: {
        orderId: orderId || '',
        jobId: jobId || '',
        buyerId: req.user?._id?.toString() || '',
      },
    });

    logger.info(`Created Stripe PaymentIntent ${paymentIntent.id} for LKR ${amount}`);

    res.status(200).json(
      new ApiResponse(
        200,
        { clientSecret: paymentIntent.client_secret },
        'Payment intent created successfully'
      )
    );
  } catch (error: any) {
    logger.error(`Stripe PaymentIntent creation failed: ${error.message}`);
    throw new ApiError(500, `Stripe payment creation failed: ${error.message}`);
  }
});

/**
 * PATCH /api/v1/payments/confirm
 * Confirms payment after frontend completes checkout, updates statuses, and routes funds to escrow.
 */
export const confirmPaymentAndUpdateEscrow = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { orderId, jobId } = req.body;

  if (!orderId && !jobId) {
    throw new ApiError(400, 'Either orderId or jobId must be provided to confirm payment.');
  }

  if (orderId) {
    // 1. Find the relevant Order
    const order = await Order.findById(orderId);
    if (!order) {
      throw new ApiError(404, `Order with ID ${orderId} not found`);
    }

    // 2. Update status and escrow status
    order.status = OrderStatus.PAID;
    order.escrowStatus = EscrowStatus.HELD;

    await order.save();
    logger.info(`Order ${orderId} paid successfully, funds held in escrow`);

    return res.status(200).json(
      new ApiResponse(
        200,
        order,
        'Order payment confirmed and escrow balance updated successfully'
      )
    );
  }

  if (jobId) {
    // 1. Find the relevant Lapidary Cutting Job
    const job = await CuttingJob.findById(jobId);
    if (!job) {
      throw new ApiError(404, `Lapidary Job with ID ${jobId} not found`);
    }

    // 2. Update job status to accepted/in progress
    job.jobStatus = JobStatus.STONE_RECEIVED;
    job.status = CuttingStatus.IN_PROGRESS;

    // Log the progression in progress logs
    job.progressLogs.push({
      phase: JobStatus.STONE_RECEIVED,
      note: 'Payment verified. Job is active. Awaiting stone delivery/processing.',
      date: new Date(),
    });

    // 3. Find or create an Order to ensure Cutter's escrow is tracked in walletController queries
    let associatedOrder;
    if (job.orderId) {
      associatedOrder = await Order.findById(job.orderId);
    }

    if (!associatedOrder) {
      // Create a service order to hold cutting service escrow
      associatedOrder = await Order.create({
        buyerId: job.buyerId,
        sellerId: job.cutterId, // Cutter functions as the primary seller for this cutting service order
        cutterId: job.cutterId,
        gemId: job.gemId,
        amount: job.agreedPrice,
        adminFee: 0,
        sellerAmount: 0,
        cutterAmount: job.agreedPrice,
        status: OrderStatus.IN_CUTTING_PROCESS,
        escrowStatus: EscrowStatus.HELD,
      });
      job.orderId = associatedOrder._id as any;
    } else {
      // Update existing order and sync escrow to held
      associatedOrder.status = OrderStatus.IN_CUTTING_PROCESS;
      associatedOrder.escrowStatus = EscrowStatus.HELD;
      associatedOrder.cutterId = job.cutterId;
      associatedOrder.cutterAmount = job.agreedPrice;
      await associatedOrder.save();
    }

    await job.save();
    logger.info(`Lapidary Job ${jobId} status set to In Progress. Escrow order created/updated and held.`);

    return res.status(200).json(
      new ApiResponse(
        200,
        { job, escrowOrder: associatedOrder },
        'Lapidary Job payment confirmed and escrow balance updated successfully'
      )
    );
  }

  throw new ApiError(500, 'Internal Server Error during payment confirmation');
});
