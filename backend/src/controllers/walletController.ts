import { Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth.middleware';
import { User } from '../models/User.model';
import { Transaction } from '../models/Transaction.model';

/**
 * GET /api/v1/wallet/my-wallet
 * Retrieve real wallet balance metrics (available, escrow HELD) and transaction history.
 */
export const getWalletInfo = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user?._id || req.user?.id;
  
  if (!userId) {
    throw new ApiError(401, 'Unauthorized access: user identity missing');
  }

  // 1. Fetch real user to extract database balances
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User profile not found');
  }

  const availableBalance = user.availableBalance ?? 0;
  const escrowBalance = user.escrowBalance ?? 0;

  // 2. Fetch real Transaction history from database, sorted by most recent
  const transactions = await Transaction.find({ userId })
    .sort({ createdAt: -1 })
    .lean();

  // 3. Compute total earnings from successful escrow releases or earnings
  const totalEarnings = transactions
    .filter(
      (tx) =>
        tx.status === 'Completed' &&
        (tx.type === 'escrow_release' || tx.type === 'earning' || tx.type === 'payment') &&
        tx.amount > 0
    )
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Return real database values as a JSON response
  return res.json(
    new ApiResponse(
      200,
      {
        availableBalance,
        escrowBalance,
        totalEarnings,
        transactions,
        transactionHistory: transactions // Alias to support existing frontend integrations
      },
      'Wallet details retrieved successfully'
    )
  );
});
