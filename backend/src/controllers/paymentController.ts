import { Response } from 'express';
import Stripe from 'stripe';
import mongoose from 'mongoose';
import { env } from '../config/env';
import { Order, OrderStatus, EscrowStatus } from '../models/Order.model';
import { CuttingJob, CuttingStatus, JobStatus } from '../models/CuttingJob.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth.middleware';
import { logger } from '../config/logger';

// ---------------------------------------------------------------------------
// Stripe Initialisation
// Reads from process.env first (runtime override), falls back to env config.
// ---------------------------------------------------------------------------
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  logger.warn('⚠️  STRIPE_SECRET_KEY is missing. Stripe payments will fail at runtime.');
}

const stripe = new Stripe(stripeSecretKey || '', {
  apiVersion: '2023-08-16' as any,
  // Automatic retries for transient network errors
  maxNetworkRetries: 2,
});

// ---------------------------------------------------------------------------
// Platform fee configuration (5% platform fee on gem sale orders)
// ---------------------------------------------------------------------------
const PLATFORM_FEE_PERCENT = 0.05;

// ---------------------------------------------------------------------------
// Helper: validate a MongoDB ObjectId string
// ---------------------------------------------------------------------------
const isValidObjectId = (id: string): boolean => mongoose.Types.ObjectId.isValid(id);

// ===========================================================================
// POST /api/v1/payments/create-intent
// ---------------------------------------------------------------------------
// Creates a Stripe PaymentIntent for a gem purchase (orderId) or a lapidary
// cutting service (jobId).
//
// Body: { amount: number, orderId?: string, jobId?: string }
//
// • `amount` is in LKR (Rs.) – multiplied by 100 for Stripe's smallest unit.
// • Returns `clientSecret` for the frontend Stripe Elements / Checkout flow.
// • Uses idempotency keys tied to orderId/jobId to prevent duplicate charges
//   on client retries.
// ===========================================================================
export const createPaymentIntent = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { amount, orderId, jobId } = req.body;

  // ── 1. Validate amount ────────────────────────────────────────────────────
  if (amount === undefined || typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    throw new ApiError(400, 'Invalid amount. Must be a positive finite number (in LKR).');
  }

  // ── 2. Require exactly one of orderId / jobId ─────────────────────────────
  if (!orderId && !jobId) {
    throw new ApiError(400, 'Either orderId or jobId must be provided.');
  }
  if (orderId && jobId) {
    throw new ApiError(400, 'Provide either orderId or jobId, not both.');
  }

  const referenceId: string = (orderId || jobId)!;
  const referenceType: 'order' | 'job' = orderId ? 'order' : 'job';

  if (!isValidObjectId(referenceId)) {
    throw new ApiError(400, `Invalid ${referenceType}Id format.`);
  }

  // ── 3. Verify the reference document exists and is in a payable state ─────
  if (referenceType === 'order') {
    const order = await Order.findById(referenceId).lean();
    if (!order) throw new ApiError(404, `Order ${referenceId} not found.`);

    // Prevent paying an already-paid or completed order
    if (
      order.status === OrderStatus.PAID ||
      order.status === OrderStatus.COMPLETED ||
      order.escrowStatus === EscrowStatus.HELD ||
      order.escrowStatus === EscrowStatus.RELEASED
    ) {
      throw new ApiError(409, `Order ${referenceId} has already been paid or is in a non-payable state.`);
    }

    // Buyer authorisation: only the order's buyer may pay
    if (order.buyerId.toString() !== req.user?._id?.toString()) {
      throw new ApiError(403, 'Only the buyer associated with this order may initiate payment.');
    }
  } else {
    const job = await CuttingJob.findById(referenceId).lean();
    if (!job) throw new ApiError(404, `Lapidary Job ${referenceId} not found.`);

    // Prevent re-payment of active / completed jobs
    if (
      job.status === CuttingStatus.IN_PROGRESS ||
      job.status === CuttingStatus.COMPLETED ||
      job.jobStatus === JobStatus.STONE_RECEIVED ||
      job.jobStatus === JobStatus.PRE_FORMING ||
      job.jobStatus === JobStatus.FACETING ||
      job.jobStatus === JobStatus.POLISHED ||
      job.jobStatus === JobStatus.READY_TO_SHIP ||
      job.jobStatus === JobStatus.COMPLETED
    ) {
      throw new ApiError(409, `Lapidary Job ${referenceId} is already active or completed.`);
    }

    // Buyer authorisation
    if (job.buyerId.toString() !== req.user?._id?.toString()) {
      throw new ApiError(403, 'Only the buyer associated with this job may initiate payment.');
    }
  }

  // ── 4. Build Stripe PaymentIntent ─────────────────────────────────────────
  // Convert LKR to smallest unit (paisa/cents equivalent): multiply by 100.
  const stripeAmount = Math.round(amount * 100);

  // Idempotency key: tied to the reference document so retries don't double-charge.
  const idempotencyKey = `payment_intent_${referenceType}_${referenceId}`;

  let paymentIntent: Stripe.PaymentIntent;
  try {
    paymentIntent = await stripe.paymentIntents.create(
      {
        amount: stripeAmount,
        currency: 'lkr',
        // Automatic payment methods: lets Stripe show available methods for LKR.
        automatic_payment_methods: { enabled: true },
        metadata: {
          referenceType,
          orderId: orderId || '',
          jobId: jobId || '',
          buyerId: req.user?._id?.toString() || '',
          amountLKR: String(amount),
        },
        description: orderId
          ? `GemTrade Order Payment – Rs. ${amount.toLocaleString()}`
          : `GemTrade Lapidary Service Payment – Rs. ${amount.toLocaleString()}`,
      },
      { idempotencyKey }
    );
  } catch (stripeError: any) {
    logger.error(`Stripe PaymentIntent creation failed: ${stripeError.message}`, {
      type: stripeError.type,
      code: stripeError.code,
      referenceId,
    });
    throw new ApiError(502, `Stripe payment creation failed: ${stripeError.message}`);
  }

  logger.info(
    `Created Stripe PaymentIntent ${paymentIntent.id} | ` +
    `${referenceType}=${referenceId} | LKR ${amount} | ` +
    `buyer=${req.user?._id}`
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amountLKR: amount,
        currency: 'lkr',
      },
      'Payment intent created successfully. Use the clientSecret to complete payment on the frontend.'
    )
  );
});

// ===========================================================================
// PATCH /api/v1/payments/confirm
// ---------------------------------------------------------------------------
// Called by the frontend AFTER Stripe.js confirms payment client-side.
// Verifies the PaymentIntent status directly with Stripe (server-to-server)
// before trusting the confirmation — this prevents fraudulent calls.
//
// Body: { orderId?: string, jobId?: string, paymentIntentId: string }
//
// For an ORDER:
//   • Sets status → PAID, escrowStatus → HELD
//   • Computes adminFee (5%) and sellerAmount
//   • Stores stripePaymentIntentId on the order
//
// For a LAPIDARY JOB:
//   • Sets job.status → IN_PROGRESS, job.jobStatus → STONE_RECEIVED
//   • Appends a progress log entry
//   • Updates the linked Order (or creates one if missing) with escrow HELD
// ===========================================================================
export const confirmPaymentAndUpdateEscrow = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { orderId, jobId, paymentIntentId } = req.body;

  // ── 1. Input validation ───────────────────────────────────────────────────
  if (!orderId && !jobId) {
    throw new ApiError(400, 'Either orderId or jobId must be provided.');
  }
  if (orderId && jobId) {
    throw new ApiError(400, 'Provide either orderId or jobId, not both.');
  }
  if (!paymentIntentId || typeof paymentIntentId !== 'string' || !paymentIntentId.startsWith('pi_')) {
    throw new ApiError(
      400,
      'A valid paymentIntentId (starting with "pi_") is required to confirm payment. ' +
      'Obtain it from the createPaymentIntent response.'
    );
  }

  const referenceId: string = (orderId || jobId)!;
  if (!isValidObjectId(referenceId)) {
    throw new ApiError(400, 'Invalid orderId/jobId format.');
  }

  // ── 2. Verify payment with Stripe (server-to-server) ─────────────────────
  // SECURITY: Never trust the frontend to report payment success.
  // Always verify the PaymentIntent status directly with Stripe.
  let intent: Stripe.PaymentIntent;
  try {
    intent = await stripe.paymentIntents.retrieve(paymentIntentId);
  } catch (stripeError: any) {
    logger.error(`Stripe PaymentIntent retrieve failed: ${stripeError.message}`);
    throw new ApiError(502, `Could not verify payment with Stripe: ${stripeError.message}`);
  }

  if (intent.status !== 'succeeded') {
    logger.warn(
      `Payment confirmation attempted for PaymentIntent ${paymentIntentId} ` +
      `with non-succeeded status: ${intent.status}`
    );
    throw new ApiError(
      402,
      `Payment has not been completed. Stripe status: "${intent.status}". ` +
      'Please complete the payment on the frontend before confirming.'
    );
  }

  // ── 3. Cross-validate metadata: ensure PaymentIntent belongs to this reference ──
  const metaOrderId = intent.metadata?.orderId || '';
  const metaJobId   = intent.metadata?.jobId   || '';

  if (orderId && metaOrderId !== orderId) {
    throw new ApiError(
      422,
      `PaymentIntent ${paymentIntentId} was not created for order ${orderId}. ` +
      'Possible mismatch – payment confirmation rejected.'
    );
  }
  if (jobId && metaJobId !== jobId) {
    throw new ApiError(
      422,
      `PaymentIntent ${paymentIntentId} was not created for job ${jobId}. ` +
      'Possible mismatch – payment confirmation rejected.'
    );
  }

  // ── 4a. GEM ORDER FLOW ────────────────────────────────────────────────────
  if (orderId) {
    const order = await Order.findById(orderId);
    if (!order) throw new ApiError(404, `Order ${orderId} not found.`);

    // Idempotency guard: if already confirmed, return current state.
    if (order.escrowStatus === EscrowStatus.HELD && order.status === OrderStatus.PAID) {
      logger.info(`Order ${orderId} is already confirmed (idempotent call).`);
      return res.status(200).json(
        new ApiResponse(200, order, 'Order was already confirmed. No changes made.')
      );
    }

    // Guard against confirming a cancelled/disputed order
    if (
      order.status === OrderStatus.CANCELLED ||
      order.status === OrderStatus.DISPUTED ||
      order.status === OrderStatus.COMPLETED
    ) {
      throw new ApiError(409, `Order ${orderId} is in status "${order.status}" and cannot be confirmed.`);
    }

    // Compute fee breakdown from Stripe amount (in LKR)
    const totalAmountLKR = intent.amount / 100; // Convert from smallest unit back to LKR
    const adminFee       = parseFloat((totalAmountLKR * PLATFORM_FEE_PERCENT).toFixed(2));
    const sellerAmount   = parseFloat((totalAmountLKR - adminFee).toFixed(2));

    // Update order
    order.status                 = OrderStatus.PAID;
    order.escrowStatus           = EscrowStatus.HELD;
    order.stripePaymentIntentId  = paymentIntentId;
    order.amount                 = totalAmountLKR;
    order.adminFee               = adminFee;
    order.sellerAmount           = sellerAmount;

    await order.save();

    logger.info(
      `Order ${orderId} confirmed as PAID | ` +
      `Total: LKR ${totalAmountLKR} | AdminFee: LKR ${adminFee} | ` +
      `SellerAmount: LKR ${sellerAmount} | PI: ${paymentIntentId}`
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          order,
          payment: {
            paymentIntentId,
            totalAmountLKR,
            adminFee,
            sellerAmount,
            escrowStatus: EscrowStatus.HELD,
          },
        },
        'Gem order payment confirmed. Funds are now held in escrow pending delivery.'
      )
    );
  }

  // ── 4b. LAPIDARY JOB FLOW ─────────────────────────────────────────────────
  if (jobId) {
    const job = await CuttingJob.findById(jobId);
    if (!job) throw new ApiError(404, `Lapidary Job ${jobId} not found.`);

    // Idempotency guard
    if (job.status === CuttingStatus.IN_PROGRESS && job.jobStatus === JobStatus.STONE_RECEIVED) {
      logger.info(`Lapidary Job ${jobId} is already confirmed (idempotent call).`);
      return res.status(200).json(
        new ApiResponse(200, { job }, 'Job was already confirmed. No changes made.')
      );
    }

    const totalAmountLKR = intent.amount / 100;
    const adminFee       = parseFloat((totalAmountLKR * PLATFORM_FEE_PERCENT).toFixed(2));
    const cutterAmount   = parseFloat((totalAmountLKR - adminFee).toFixed(2));

    // Update job status to active / in-progress
    job.jobStatus = JobStatus.STONE_RECEIVED;
    job.status    = CuttingStatus.IN_PROGRESS;

    // Append progress log
    job.progressLogs.push({
      phase: JobStatus.STONE_RECEIVED,
      note: 'Payment verified with Stripe. Job is now active. Awaiting stone receipt.',
      date: new Date(),
    });

    // Find or create the linked escrow Order
    // Note: CuttingJob.orderId is required in the schema, so it always exists.
    // We update the existing linked order; only create if somehow missing.
    let escrowOrder = await Order.findById(job.orderId);

    if (!escrowOrder) {
      // Fallback: create a service order for this cutting job
      logger.warn(
        `No Order found for CuttingJob ${jobId} (orderId=${job.orderId}). ` +
        'Creating a new escrow Order as fallback.'
      );
      escrowOrder = await Order.create({
        buyerId:       job.buyerId,
        sellerId:      job.cutterId,  // Cutter acts as service provider / "seller"
        cutterId:      job.cutterId,
        gemId:         job.gemId,
        amount:        totalAmountLKR,
        adminFee,
        sellerAmount:  0,             // No gem seller for a pure cutting service
        cutterAmount,
        status:        OrderStatus.IN_CUTTING_PROCESS,
        escrowStatus:  EscrowStatus.HELD,
        stripePaymentIntentId: paymentIntentId,
      });
      job.orderId = escrowOrder._id as any;
    } else {
      // Update the existing order to reflect payment
      escrowOrder.status                = OrderStatus.IN_CUTTING_PROCESS;
      escrowOrder.escrowStatus          = EscrowStatus.HELD;
      escrowOrder.cutterId              = job.cutterId;
      escrowOrder.amount                = totalAmountLKR;
      escrowOrder.adminFee              = adminFee;
      escrowOrder.cutterAmount          = cutterAmount;
      escrowOrder.stripePaymentIntentId = paymentIntentId;
      await escrowOrder.save();
    }

    await job.save();

    logger.info(
      `Lapidary Job ${jobId} confirmed as IN_PROGRESS | ` +
      `Total: LKR ${totalAmountLKR} | CutterAmount: LKR ${cutterAmount} | ` +
      `EscrowOrder: ${escrowOrder._id} | PI: ${paymentIntentId}`
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          job,
          escrowOrder,
          payment: {
            paymentIntentId,
            totalAmountLKR,
            adminFee,
            cutterAmount,
            escrowStatus: EscrowStatus.HELD,
          },
        },
        'Lapidary job payment confirmed. Job is now active and funds are held in escrow.'
      )
    );
  }

  // Should never be reached due to validation above
  throw new ApiError(500, 'Unexpected error during payment confirmation.');
});
