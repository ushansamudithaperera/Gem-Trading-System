import { Router } from 'express';
import {
  createPaymentIntent,
  confirmPaymentAndUpdateEscrow,
} from '../controllers/paymentController';
import { authMiddleware } from '../middleware/auth.middleware';

const router: Router = Router();

// Apply authentication to ALL payment routes.
// Unauthenticated users cannot initiate or confirm payments.
router.use(authMiddleware);

/**
 * POST /api/v1/payments/create-intent
 *
 * Creates a Stripe PaymentIntent and returns a clientSecret for the frontend
 * to complete the Stripe payment flow (Elements / Checkout).
 *
 * Body:
 *   amount      {number}  — Total amount in LKR (Rs.)
 *   orderId     {string}  — MongoDB ObjectId of a gem purchase Order (mutually exclusive with jobId)
 *   jobId       {string}  — MongoDB ObjectId of a lapidary CuttingJob (mutually exclusive with orderId)
 *
 * Response:
 *   clientSecret     {string} — Pass to Stripe.js on the frontend
 *   paymentIntentId  {string} — Save this; required for the /confirm call
 *   amountLKR        {number}
 *   currency         {string} — "lkr"
 */
router.post('/create-intent', createPaymentIntent);

/**
 * PATCH /api/v1/payments/confirm
 *
 * Called after the frontend successfully completes the Stripe payment flow.
 * Verifies the PaymentIntent status directly with Stripe (server-to-server)
 * before updating the Order/Job status and routing funds to escrow.
 *
 * Body:
 *   orderId          {string}  — MongoDB ObjectId (if confirming a gem order)
 *   jobId            {string}  — MongoDB ObjectId (if confirming a cutting job)
 *   paymentIntentId  {string}  — The "pi_..." ID returned by /create-intent
 */
router.patch('/confirm', confirmPaymentAndUpdateEscrow);

export default router;
