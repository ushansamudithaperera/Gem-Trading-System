import express from 'express';
import {
  getProfile,
  updateProfile,
  getAllUsers,
  submitKYC,
  getPendingKYC,
  approveKYC,
} from '../../controllers/user.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { isAdmin } from '../../middleware/role.middleware';

const router = express.Router();

router.use(authMiddleware); // All user routes require auth

// Profile endpoints
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Admin endpoints
router.get('/', isAdmin, getAllUsers);

/**
 * KYC (Know Your Customer) endpoints
 */

// PUT /api/v1/users/kyc/submit
// Logged-in user submits KYC documents for verification
router.put('/kyc/submit', submitKYC);

// GET /api/v1/users/kyc/pending
// ADMIN ONLY - Fetch all users with pending KYC
router.get('/kyc/pending', isAdmin, getPendingKYC);

// PUT /api/v1/users/:userId/kyc/approve
// ADMIN ONLY - Approve or reject user's KYC
router.put('/:userId/kyc/approve', isAdmin, approveKYC);

export default router;