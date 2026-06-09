import express from 'express';
import { getPendingKYC, updateKYCStatus } from '../controllers/adminController';
import { getAllSystemOrders } from '../controllers/adminOrderController';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = express.Router();

// Apply authMiddleware and adminMiddleware globally to all admin routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Map the endpoints:
// GET /api/admin/kyc/pending -> getPendingKYC
router.get('/kyc/pending', getPendingKYC);

// PATCH /api/admin/kyc/:userId/status -> updateKYCStatus
router.patch('/kyc/:userId/status', updateKYCStatus);

// GET /api/admin/orders -> getAllSystemOrders
router.get('/orders', getAllSystemOrders);

export default router;
