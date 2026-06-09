import { Response } from 'express';
import { User, KYCStatus } from '../models/User.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth.middleware';
import { logger } from '../config/logger';

/**
 * GET /api/admin/kyc/pending
 * Fetch all users where kycStatus is 'Pending'
 */
export const getPendingKYC = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const pendingUsers = await User.find({ kycStatus: 'Pending' })
    .select('firstName lastName email phone companyName kycStatus kycDetails createdAt')
    .lean();

  res.json(new ApiResponse(200, pendingUsers, 'Pending KYC requests fetched successfully'));
});

/**
 * PATCH /api/admin/kyc/:userId/status
 * Update user KYC status to 'Verified' or 'Rejected'
 */
export const updateKYCStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const { status, rejectionReason } = req.body;

  if (!status || !['Verified', 'Rejected'].includes(status)) {
    throw new ApiError(400, "Status is required and must be 'Verified' or 'Rejected'");
  }

  if (status === 'Rejected' && !rejectionReason) {
    throw new ApiError(400, 'Rejection reason is required when status is Rejected');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Sync with user's kyc status
  user.kyc.reviewedAt = new Date();

  if (status === 'Verified') {
    user.kycStatus = 'Verified';
    user.kyc.status = KYCStatus.VERIFIED;
  } else {
    // If rejected, kycStatus goes back to Unverified
    user.kycStatus = 'Unverified';
    user.kyc.status = KYCStatus.REJECTED;
    user.kyc.rejectionReason = rejectionReason;
  }

  await user.save();

  logger.info(`KYC status for user ${userId} updated to ${status} by admin ${req.user?._id}`);

  const updatedUser = await User.findById(userId).select('-password');

  res.json(new ApiResponse(200, updatedUser, `KYC status updated to ${status} successfully`));
});
