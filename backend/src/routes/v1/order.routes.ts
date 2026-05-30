import express from 'express';
import {
  createOrder,
  cancelOrder,
  getUserOrders,
  updateTrackingInfo,
  releaseEscrow,
} from '../../controllers/order.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { isBuyer, isSeller } from '../../middleware/role.middleware';
import {
  checkOrderSeller,
  checkOrderBuyer,
} from '../../middleware/orderOwnership.middleware';

const router = express.Router();

router.use(authMiddleware);

// Create order (buyer only)
router.post('/', isBuyer, createOrder);

// Get user's orders (both as buyer and seller)
router.get('/', getUserOrders);

// Cancel order (buyer only, before dispatch)
router.put('/:orderId/cancel', isBuyer, cancelOrder);

/**
 * ESCROW ENDPOINTS
 */

// Update tracking info (seller only)
// PUT /api/v1/orders/:id/tracking
// Seller provides courier company, tracking number, and optional status
router.put('/:id/tracking', isSeller, checkOrderSeller, updateTrackingInfo);

// Release escrow (buyer confirms delivery, funds released to seller)
// PUT /api/v1/orders/:id/release-escrow
// Buyer confirms they received the gem, escrow is released to seller's account
router.put('/:id/release-escrow', isBuyer, checkOrderBuyer, releaseEscrow);

export default router;