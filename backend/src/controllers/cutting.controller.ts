import { Response } from 'express';
import { CuttingJob, CuttingStatus, JobStatus } from '../models/CuttingJob.model';
import { Order, OrderStatus } from '../models/Order.model';
import { User } from '../models/User.model';
import { Gem } from '../models/Gem.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * POST /api/v1/cutting-jobs
 * Buyer requests a cutter to process a rough gem
 */
export const requestCutter = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { cutterId, gemId, instructions, expectedFinishDate, agreedPrice } = req.body;
  const buyerId = req.user!._id;

  // Validate inputs
  if (!cutterId || !gemId || !instructions || !expectedFinishDate || agreedPrice === undefined) {
    throw new ApiError(400, 'Missing required fields: cutterId, gemId, instructions, expectedFinishDate, agreedPrice');
  }

  if (agreedPrice < 0) {
    throw new ApiError(400, 'Agreed price cannot be negative');
  }

  // Verify gem exists and belongs to buyer
  const gem = await Gem.findById(gemId);
  if (!gem) {
    throw new ApiError(404, 'Gem not found');
  }

  if (gem.sellerId.toString() !== buyerId.toString()) {
    throw new ApiError(403, 'You can only request cutting for gems you own');
  }

  // Verify cutter exists and has CUTTER role
  const cutter = await User.findById(cutterId);
  if (!cutter) {
    throw new ApiError(404, 'Cutter not found');
  }

  if (!cutter.roles.includes('CUTTER')) {
    throw new ApiError(400, 'Selected user is not a cutter');
  }

  // Validate expected finish date is in the future
  const finishDate = new Date(expectedFinishDate);
  if (finishDate <= new Date()) {
    throw new ApiError(400, 'Expected finish date must be in the future');
  }

  // Create cutting job
  const cuttingJob = await CuttingJob.create({
    buyerId,
    cutterId,
    gemId,
    instructions,
    expectedFinishDate: finishDate,
    agreedPrice,
    jobStatus: JobStatus.PENDING_ACCEPTANCE,
    status: CuttingStatus.PENDING,
  });

  // Populate references for response
  await cuttingJob.populate(['buyerId', 'cutterId', 'gemId']);

  res.status(201).json(
    new ApiResponse(201, cuttingJob, 'Cutting job request sent to cutter')
  );
});

/**
 * PUT /api/v1/cutting-jobs/:id/status
 * Cutter updates the job status and progress
 */
export const updateJobStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id: jobId } = req.params;
  const { jobStatus, actualWeightCarats, progressImages, notes } = req.body;
  const cutterId = req.user!._id;

  // Validate jobStatus if provided
  if (jobStatus && !Object.values(JobStatus).includes(jobStatus)) {
    throw new ApiError(400, `Invalid job status. Must be one of: ${Object.values(JobStatus).join(', ')}`);
  }

  // Fetch the job
  const job = await CuttingJob.findById(jobId);
  if (!job) {
    throw new ApiError(404, 'Cutting job not found');
  }

  // Verify the user is the assigned cutter
  if (job.cutterId.toString() !== cutterId.toString()) {
    throw new ApiError(403, 'You can only update jobs assigned to you');
  }

  // Verify the job is not already completed
  if (job.jobStatus === JobStatus.COMPLETED) {
    throw new ApiError(400, 'Cannot update a completed job');
  }

  // Validate status progression (optional but recommended)
  const statusProgression = [
    JobStatus.PENDING_ACCEPTANCE,
    JobStatus.STONE_RECEIVED,
    JobStatus.PRE_FORMING,
    JobStatus.FACETING,
    JobStatus.POLISHED,
    JobStatus.READY_TO_SHIP,
    JobStatus.COMPLETED,
  ];

  if (jobStatus) {
    const currentIndex = statusProgression.indexOf(job.jobStatus);
    const newIndex = statusProgression.indexOf(jobStatus);

    // Allow updates to same status or next status
    if (newIndex > currentIndex + 1) {
      throw new ApiError(
        400,
        `Cannot skip statuses. Current: ${job.jobStatus}, requested: ${jobStatus}`
      );
    }

    // Update job status
    job.jobStatus = jobStatus;

    // If job is completed, record actual finish date
    if (jobStatus === JobStatus.COMPLETED) {
      job.actualFinishDate = new Date();
      
      // Update linked order status (if exists)
      if (job.orderId) {
        await Order.findByIdAndUpdate(
          job.orderId,
          { status: OrderStatus.PENDING_DISPATCH }
        );
      }
    }
  }

  // Update optional fields
  if (actualWeightCarats !== undefined) {
    if (actualWeightCarats < 0) {
      throw new ApiError(400, 'Actual weight carats cannot be negative');
    }
    job.actualWeightCarats = actualWeightCarats;
  }

  if (progressImages && Array.isArray(progressImages)) {
    job.progressImages.push(...progressImages);
  }

  if (notes) {
    job.notes = notes;
  }

  // Save and populate
  await job.save();
  await job.populate(['buyerId', 'cutterId', 'gemId']);

  res.json(new ApiResponse(200, job, `Job status updated to ${job.jobStatus}`));
});

/**
 * GET /api/v1/cutting-jobs/my-jobs
 * Fetch jobs based on user role:
 * - Cutter: Shows jobs assigned to them (their queue)
 * - Buyer: Shows jobs they requested
 * - Admin: Shows all jobs
 */
export const getMyJobs = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.user!._id;
  const userRoles = req.user!.roles;
  const { status, sortBy = 'createdAt', order = 'desc' } = req.query;

  // Build query based on user role
  let query: any = {};

  if (userRoles.includes('CUTTER')) {
    // Cutter: show jobs assigned to them
    query.cutterId = userId;
  } else if (userRoles.includes('BUYER')) {
    // Buyer: show jobs they requested
    query.buyerId = userId;
  } else if (userRoles.includes('ADMIN')) {
    // Admin: show all jobs (no filter)
  } else {
    throw new ApiError(403, 'You do not have permission to view cutting jobs');
  }

  // Filter by status if provided
  if (status) {
    const jobStatusValues = Object.values(JobStatus);
    if (!jobStatusValues.includes(status as JobStatus)) {
      throw new ApiError(400, `Invalid status filter. Must be one of: ${jobStatusValues.join(', ')}`);
    }
    query.jobStatus = status;
  }

  // Determine sort order
  const sortValue = order === 'asc' ? 1 : -1;
  const sortObj: any = {};
  sortObj[String(sortBy)] = sortValue;

  // Fetch jobs
  const jobs = await CuttingJob.find(query)
    .populate('buyerId', 'firstName lastName email')
    .populate('cutterId', 'firstName lastName email rating totalTransactions')
    .populate('gemId', 'name caratWeight quality color')
    .sort(sortObj)
    .lean();

  // Provide summary information
  const summary = {
    total: jobs.length,
    byStatus: Object.values(JobStatus).reduce((acc, status) => {
      acc[status] = jobs.filter(job => job.jobStatus === status).length;
      return acc;
    }, {} as Record<JobStatus, number>),
  };

  res.json(
    new ApiResponse(200, { jobs, summary }, 'Cutting jobs fetched successfully')
  );
});

/**
 * GET /api/v1/cutting-jobs/:id
 * Get details of a specific cutting job
 */
export const getJobDetails = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id: jobId } = req.params;
  const userId = req.user!._id;

  const job = await CuttingJob.findById(jobId)
    .populate('buyerId', 'firstName lastName email phone businessName')
    .populate('cutterId', 'firstName lastName email rating totalTransactions')
    .populate('gemId');

  if (!job) {
    throw new ApiError(404, 'Cutting job not found');
  }

  // Verify user has access to this job
  const isBuyer = job.buyerId._id.toString() === userId.toString();
  const isCutter = job.cutterId._id.toString() === userId.toString();
  const isAdmin = req.user!.roles.includes('ADMIN');

  if (!isBuyer && !isCutter && !isAdmin) {
    throw new ApiError(403, 'You do not have access to this cutting job');
  }

  res.json(new ApiResponse(200, job, 'Job details fetched'));
});

/**
 * PUT /api/v1/cutting-jobs/:id/accept
 * Cutter accepts the cutting job (changes status from PENDING_ACCEPTANCE to STONE_RECEIVED)
 */
export const acceptJob = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { id: jobId } = req.params;
  const cutterId = req.user!._id;

  const job = await CuttingJob.findById(jobId);
  if (!job) {
    throw new ApiError(404, 'Cutting job not found');
  }

  // Verify the user is the assigned cutter
  if (job.cutterId.toString() !== cutterId.toString()) {
    throw new ApiError(403, 'Only the assigned cutter can accept this job');
  }

  // Job must be in PENDING_ACCEPTANCE status
  if (job.jobStatus !== JobStatus.PENDING_ACCEPTANCE) {
    throw new ApiError(400, `Job is in status: ${job.jobStatus}. Cannot accept job that is already accepted or completed.`);
  }

  job.jobStatus = JobStatus.STONE_RECEIVED;
  await job.save();
  await job.populate(['buyerId', 'cutterId', 'gemId']);

  res.json(new ApiResponse(200, job, 'Cutting job accepted'));
});

// Backward compatibility exports
export const hireCutter = requestCutter;

export const updateCuttingProgress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { jobId } = req.params;
  const { progressImages, status } = req.body;
  const cutterId = req.user!._id;

  const job = await CuttingJob.findOne({ _id: jobId, cutterId });
  if (!job) throw new ApiError(404, 'Cutting job not found');

  if (progressImages) job.progressImages.push(...progressImages);
  if (status) job.status = status;

  if (status === CuttingStatus.COMPLETED) {
    job.actualFinishDate = new Date();
    // Update linked order status (if exists)
    if (job.orderId) {
      await Order.findByIdAndUpdate(job.orderId, { status: OrderStatus.PENDING_DISPATCH });
    }
  }

  await job.save();
  res.json(new ApiResponse(200, job, 'Progress updated'));
});