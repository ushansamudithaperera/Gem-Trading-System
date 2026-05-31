import express from 'express';
import { openDispute, getDisputes, resolveDispute } from '../../controllers/dispute.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { isAdmin } from '../../middleware/role.middleware';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * POST /api/v1/disputes
 * Open a new dispute (Buyer or Seller)
 * Automatically freezes escrow
 */
router.post('/', openDispute);

/**
 * GET /api/v1/disputes
 * Fetch disputes (role-based):
 * - ADMIN: All platform disputes
 * - Others: Only disputes they are involved in
 */
router.get('/', getDisputes);

/**
 * PUT /api/v1/disputes/:id/resolve
 * Resolve dispute (ADMIN ONLY)
 * Releases or refunds escrow based on decision
 */
router.put('/:id/resolve', isAdmin, resolveDispute);

export default router;