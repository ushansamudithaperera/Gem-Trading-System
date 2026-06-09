import express from 'express';
import {
  createDispute,
  getMyDisputes,
  getAllDisputes,
  resolveDispute
} from '../controllers/disputeController';
import { authMiddleware } from '../middleware/auth.middleware';
import { adminMiddleware } from '../middleware/adminMiddleware';

const router = express.Router();

// User routes (Protected by authMiddleware)
router.post('/', authMiddleware, createDispute);
router.get('/my-disputes', authMiddleware, getMyDisputes);

// Admin routes (Protected by authMiddleware AND adminMiddleware)
router.get('/all', authMiddleware, adminMiddleware, getAllDisputes);
router.patch('/:id/resolve', authMiddleware, adminMiddleware, resolveDispute);

export default router;
