import express from 'express';
import { createGem, getMarketplace, getGemById } from '../../controllers/gem.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { isSeller } from '../../middleware/role.middleware';

const router = express.Router();

// Public routes
router.get('/marketplace', getMarketplace);
router.get('/:id', getGemById);

// Protected routes
router.post('/', authMiddleware, isSeller, createGem);

export default router;