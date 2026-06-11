import { Router } from 'express';
import { getWalletInfo } from '../controllers/walletController';
import { authMiddleware } from '../middleware/auth.middleware';

const router: Router = Router();

// Protect all wallet endpoints with authMiddleware
router.use(authMiddleware);

/**
 * GET /api/v1/wallet/my-wallet
 * Retrieve real database balances and transaction logs for the logged-in user.
 */
router.get('/my-wallet', getWalletInfo);

export default router;
