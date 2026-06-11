import express from 'express';
import {
  createPaymentIntent,
  confirmPaymentAndUpdateEscrow,
} from '../controllers/paymentController';
import { authMiddleware } from '../middleware/auth.middleware';

const router = express.Router();

// Both routes require authentication
router.use(authMiddleware);

// POST /api/v1/payments/create-intent
router.post('/create-intent', createPaymentIntent);

// PATCH /api/v1/payments/confirm
router.patch('/confirm', confirmPaymentAndUpdateEscrow);

export default router;
