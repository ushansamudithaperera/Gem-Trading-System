import { Response } from 'express';
import { User, KYCStatus } from '../models/User.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth.middleware';
import { logger } from '../config/logger';

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.user!._id).select('-password');
  if (!user) throw new ApiError(404, 'User not found');
  res.json(new ApiResponse(200, user, 'Profile retrieved'));
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const allowedUpdates = [
    'firstName',
    'lastName',
    'phone',
    'avatar',
    'businessName',
    'companyName',
    'profilePicture',
    'address',
  ];
  const updates: any = Object.keys(req.body)
    .filter(key => allowedUpdates.includes(key))
    .reduce((obj, key) => ({ ...obj, [key]: req.body[key] }), {});

  // Sync aliases for backward compatibility
  if (updates.companyName && !updates.businessName) {
    updates.businessName = updates.companyName;
  } else if (updates.businessName && !updates.companyName) {
    updates.companyName = updates.businessName;
  }

  if (updates.profilePicture && !updates.avatar) {
    updates.avatar = updates.profilePicture;
  } else if (updates.avatar && !updates.profilePicture) {
    updates.profilePicture = updates.avatar;
  }

  const user = await User.findByIdAndUpdate(req.user!._id, updates, { new: true }).select('-password');
  if (!user) throw new ApiError(404, 'User not found');
  res.json(new ApiResponse(200, user, 'Profile updated'));
});

export const getAllUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
  if (!req.user!.roles.includes('ADMIN')) throw new ApiError(403, 'Admin only');
  const users = await User.find().select('-password').limit(100);
  res.json(new ApiResponse(200, users, 'Users fetched'));
});

/**
 * PUT /api/v1/users/kyc/submit
 * Submit KYC documents for verification
 * Logged-in user submits their document URLs
 * Status automatically changes to 'pending'
 */
export const submitKYC = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { documentUrls, idNumber, dob, documentType } = req.body;
  const userId = req.user!._id;

  // Validate input
  if (!documentUrls || !Array.isArray(documentUrls) || documentUrls.length === 0) {
    throw new ApiError(400, 'Document URLs are required and must be a non-empty array');
  }

  if (documentUrls.length > 10) {
    throw new ApiError(400, 'Maximum 10 documents allowed for KYC submission');
  }

  // Validate all URLs are strings
  if (!documentUrls.every((url) => typeof url === 'string')) {
    throw new ApiError(400, 'All document URLs must be valid strings');
  }

  // Fetch user
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Update KYC information (backward compatible)
  user.kyc = {
    documentUrls,
    status: KYCStatus.PENDING,
    submittedAt: new Date(),
  };

  // Update new KYC status and details
  user.kycStatus = 'Pending';
  user.kycDetails = {
    documentType: documentType || 'NIC',
    idNumber: idNumber || '',
    dob: dob || '',
    documentUrls,
  };

  await user.save();

  logger.info(`KYC submitted by user ${userId}`, {
    userId,
    documentCount: documentUrls.length,
    submittedAt: user.kyc.submittedAt,
  });

  // Return user without password
  const response = await User.findById(userId).select('-password');

  res.json(
    new ApiResponse(
      200,
      response,
      'KYC documents submitted successfully. Status changed to pending.'
    )
  );
});

/**
 * GET /api/v1/users/kyc/pending
 * ADMIN ONLY
 * Fetch all users with pending KYC verification
 */
export const getPendingKYC = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Strict admin-only check
  if (!req.user!.roles.includes('ADMIN')) {
    throw new ApiError(403, 'Access denied. Only administrators can view pending KYC requests.');
  }

  const { sortBy = 'submittedAt', order = 'asc' } = req.query;

  // Validate sort field
  const validSortFields = ['submittedAt', 'email', 'firstName'];
  if (!validSortFields.includes(String(sortBy))) {
    throw new ApiError(400, `Invalid sortBy field. Must be one of: ${validSortFields.join(', ')}`);
  }

  // Determine sort order
  const sortValue = order === 'desc' ? -1 : 1;
  const sortObj: any = {};
  sortObj[`kyc.${String(sortBy)}`] = sortValue;

  // Fetch users with pending KYC status
  const pendingUsers = await User.find({ 'kyc.status': KYCStatus.PENDING })
    .select('-password')
    .sort(sortObj)
    .lean();

  // Summary information
  const summary = {
    total: pendingUsers.length,
    byRole: {
      BUYER: pendingUsers.filter((u) => u.roles.includes('BUYER')).length,
      SELLER: pendingUsers.filter((u) => u.roles.includes('SELLER')).length,
      CUTTER: pendingUsers.filter((u) => u.roles.includes('CUTTER')).length,
    },
  };

  res.json(
    new ApiResponse(200, { users: pendingUsers, summary }, 'Pending KYC requests fetched')
  );
});

/**
 * PUT /api/v1/users/:userId/kyc/approve
 * ADMIN ONLY
 * Approve (verify) or reject a user's KYC submission
 */
export const approveKYC = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Strict admin-only check
  if (!req.user!.roles.includes('ADMIN')) {
    throw new ApiError(403, 'Access denied. Only administrators can approve KYC requests.');
  }

  const { userId } = req.params;
  const { approved, rejectionReason } = req.body;

  // Validate input
  if (typeof approved !== 'boolean') {
    throw new ApiError(400, 'Approved field is required and must be a boolean');
  }

  if (!approved && !rejectionReason) {
    throw new ApiError(400, 'Rejection reason is required when rejecting KYC');
  }

  if (rejectionReason && rejectionReason.length > 500) {
    throw new ApiError(400, 'Rejection reason must not exceed 500 characters');
  }

  // Fetch user
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Check if user has pending KYC
  if (user.kyc.status !== KYCStatus.PENDING) {
    throw new ApiError(400, `Cannot review KYC with status: ${user.kyc.status}`);
  }

  // Update KYC status
  if (approved) {
    user.kyc.status = KYCStatus.VERIFIED;
    user.kycStatus = 'Verified';
    logger.info(`KYC approved for user ${userId}`, {
      userId,
      approvedBy: req.user!._id,
      timestamp: new Date(),
    });
  } else {
    user.kyc.status = KYCStatus.REJECTED;
    user.kycStatus = 'Unverified';
    user.kyc.rejectionReason = rejectionReason;
    logger.info(`KYC rejected for user ${userId}`, {
      userId,
      rejectedBy: req.user!._id,
      reason: rejectionReason,
      timestamp: new Date(),
    });
  }

  // Set review timestamp
  user.kyc.reviewedAt = new Date();

  await user.save();

  // Return updated user
  const response = await User.findById(userId).select('-password');

  res.json(
    new ApiResponse(
      200,
      response,
      approved ? 'KYC approved successfully' : 'KYC rejected successfully'
    )
  );
});

export const changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user!._id;

  if (!currentPassword || !newPassword) {
    throw new ApiError(400, 'Current password and new password are required');
  }

  if (newPassword.length < 6) {
    throw new ApiError(400, 'New password must be at least 6 characters long');
  }

  const user = await User.findById(userId).select('+password');
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError(400, 'Incorrect current password');
  }

  user.password = newPassword;
  await user.save();

  logger.info(`Password changed for user ${userId}`);

  res.json(new ApiResponse(200, null, 'Password updated successfully'));
});

export const toggle2FA = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const { is2FAEnabled } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  if (is2FAEnabled !== undefined) {
    user.is2FAEnabled = Boolean(is2FAEnabled);
  } else {
    user.is2FAEnabled = !user.is2FAEnabled;
  }

  await user.save();

  logger.info(`2FA status updated for user ${userId} to ${user.is2FAEnabled}`);

  const response = await User.findById(userId).select('-password');

  res.json(
    new ApiResponse(
      200,
      response,
      `2FA is now ${user.is2FAEnabled ? 'enabled' : 'disabled'}`
    )
  );
});