import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { CuttingJob } from '../models/CuttingJob.model';
import { ApiError } from '../utils/ApiError';

/**
 * Middleware to verify user has access to a specific cutting job
 * Allows: Buyer, Cutter, Admin
 * Denies: Other users
 */
export const checkCuttingJobOwnership = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    const { id: jobId } = req.params;
    const userId = req.user._id.toString();

    // Fetch the job
    const job = await CuttingJob.findById(jobId);
    if (!job) {
      return next(new ApiError(404, 'Cutting job not found'));
    }

    const isBuyer = job.buyerId.toString() === userId;
    const isCutter = job.cutterId.toString() === userId;
    const isAdmin = req.user.roles.includes('ADMIN');

    // Allow if user is buyer, cutter, or admin
    if (!isBuyer && !isCutter && !isAdmin) {
      return next(
        new ApiError(403, 'Access denied. You are not a participant in this cutting job')
      );
    }

    // Attach job and user type info to request for use in controllers
    req.cuttingJob = job;
    req.isCuttingJobBuyer = isBuyer;
    req.isCuttingJobCutter = isCutter;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Convenience middleware to check if user is the BUYER of the cutting job
 * Use for buyer-only operations
 */
export const checkCuttingJobBuyer = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    const { id: jobId } = req.params;
    const userId = req.user._id.toString();

    const job = await CuttingJob.findById(jobId);
    if (!job) {
      return next(new ApiError(404, 'Cutting job not found'));
    }

    const isBuyer = job.buyerId.toString() === userId;
    const isAdmin = req.user.roles.includes('ADMIN');

    if (!isBuyer && !isAdmin) {
      return next(
        new ApiError(403, 'Access denied. Only the buyer can perform this action')
      );
    }

    req.cuttingJob = job;
    req.isCuttingJobBuyer = true;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Convenience middleware to check if user is the CUTTER of the cutting job
 * Use for cutter-only operations
 */
export const checkCuttingJobCutter = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    const { id: jobId } = req.params;
    const userId = req.user._id.toString();

    const job = await CuttingJob.findById(jobId);
    if (!job) {
      return next(new ApiError(404, 'Cutting job not found'));
    }

    const isCutter = job.cutterId.toString() === userId;
    const isAdmin = req.user.roles.includes('ADMIN');

    if (!isCutter && !isAdmin) {
      return next(
        new ApiError(403, 'Access denied. Only the assigned cutter can perform this action')
      );
    }

    req.cuttingJob = job;
    req.isCuttingJobCutter = true;

    next();
  } catch (error) {
    next(error);
  }
};
