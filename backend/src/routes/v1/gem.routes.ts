import express from 'express';
import {
  createGem,
  getMarketplace,
  getGemById,
  updateGem,
  deleteGem,
  getMyInventory,
  getSellerGems,
  getSellerStats,
} from '../../controllers/gem.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { isSellerOrCutter } from '../../middleware/role.middleware';

const router = express.Router();

// ─── Public Routes ───────────────────────────────────────
router.get('/marketplace', getMarketplace);
router.get('/:id', getGemById);

// ─── Protected Routes: Seller/Cutter Actions ────────────
// Create gem listing (SELLER or CUTTER)
router.post('/', authMiddleware, isSellerOrCutter, createGem);

// Get my inventory (SELLER or CUTTER) - must be before /:id route
router.get('/inventory/my', authMiddleware, isSellerOrCutter, getMyInventory);

// Get seller gems for inventory (SELLER or CUTTER)
router.get('/seller/gems', authMiddleware, isSellerOrCutter, getSellerGems);

// Get seller stats (SELLER or CUTTER)
router.get('/seller/stats', authMiddleware, isSellerOrCutter, getSellerStats);

// Update gem listing (SELLER or CUTTER - must own the gem)
router.put('/:id', authMiddleware, isSellerOrCutter, updateGem);

// Delete gem listing (SELLER or CUTTER - must own the gem)
router.delete('/:id', authMiddleware, isSellerOrCutter, deleteGem);

export default router;