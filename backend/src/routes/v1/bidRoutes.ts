import express from 'express';
import {
  createBid,
  getBuyerBids,
  getSellerBids,
  updateBidStatus,
} from '../../controllers/bidController';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = express.Router();

// Apply authMiddleware to all routes in this router
router.use(authMiddleware);

// POST / - Place a new bid
router.post('/', createBid);

// GET /buyer - Fetch bids placed by the authenticated buyer
router.get('/buyer', getBuyerBids);

// GET /seller - Fetch bids received by the authenticated seller
router.get('/seller', getSellerBids);

// PATCH /:id/status - Accept, reject, or cancel a bid
router.patch('/:id/status', updateBidStatus);

export default router;
