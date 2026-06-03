import express from 'express';
import { createGem, getAllGems, getGemById } from '../../controllers/gemController';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = express.Router();

// GET / - Public list of gemstones
router.get('/', getAllGems);

// GET /:id - Public gemstone details
router.get('/:id', getGemById);

// POST / - Protect with authMiddleware
router.post('/', authMiddleware, createGem);

export default router;
