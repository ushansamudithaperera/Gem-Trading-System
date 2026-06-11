import express from 'express';
import {
  getProfile,
  updateProfile,
  getAllUsers,
  submitKYC,
  getPendingKYC,
  approveKYC,
  changePassword,
  toggle2FA,
  updateCutterProfile,
  getAllCutters,
} from '../../controllers/user.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { isAdmin } from '../../middleware/role.middleware';

const router = express.Router();

router.use(authMiddleware); // All user routes require auth

// Profile endpoints
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Password endpoint
router.put('/password', changePassword);

// 2FA endpoint
router.patch('/2fa', toggle2FA);

// Admin endpoints
router.get('/', isAdmin, getAllUsers);

/**
 * KYC (Know Your Customer) endpoints
 */

// POST /api/v1/users/kyc
// Logged-in user submits KYC documents for verification
router.post('/kyc', submitKYC);

// PUT /api/v1/users/kyc/submit
// Logged-in user submits KYC documents for verification (backward compatibility)
router.put('/kyc/submit', submitKYC);

// GET /api/v1/users/kyc/pending
// ADMIN ONLY - Fetch all users with pending KYC
router.get('/kyc/pending', isAdmin, getPendingKYC);

// PUT /api/v1/users/:userId/kyc/approve
// ADMIN ONLY - Approve or reject user's KYC
router.put('/:userId/kyc/approve', isAdmin, approveKYC);

/**
 * Cutter Profile endpoints
 */

// PUT /api/v1/users/cutter-profile
// Logged-in CUTTER updates their lapidary profile
router.put('/cutter-profile', updateCutterProfile);

// GET /api/v1/users/cutters
// Fetch all cutters
router.get('/cutters', getAllCutters);

export default router;