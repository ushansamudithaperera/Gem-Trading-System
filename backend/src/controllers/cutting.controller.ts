import { Request, Response } from 'express';
import { CuttingJob, CuttingStatus } from '../models/CuttingJob.model';
import { Order, OrderStatus } from '../models/Order.model';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

export const hireCutter = asyncHandler(async (req: Request, res: Response) => {
  const { orderId, cutterId, instructions, expectedFinishDate, cutterFee } = req.body;
  const buyerId = req.user!._id;

  const order = await Order.findById(orderId);
  if (!order || order.buyerId.toString() !== buyerId.toString()) {
    throw new ApiError(400, 'Invalid order');
  }

  const cuttingJob = await CuttingJob.create({
    orderId,
    buyerId,
    cutterId,
    roughGemId: order.gemId,
    instructions,
    expectedFinishDate,
    cutterFee,
    status: CuttingStatus.PENDING,
  });

  order.cutterId = cutterId;
  order.status = OrderStatus.IN_CUTTING_PROCESS;
  await order.save();

  res.status(201).json(new ApiResponse(201, cuttingJob, 'Cutter hired'));
});

export const updateCuttingProgress = asyncHandler(async (req: Request, res: Response) => {
  const { jobId } = req.params;
  const { progressImages, status } = req.body;
  const cutterId = req.user!._id;

  const job = await CuttingJob.findOne({ _id: jobId, cutterId });
  if (!job) throw new ApiError(404, 'Cutting job not found');

  if (progressImages) job.progressImages.push(...progressImages);
  if (status) job.status = status;

  if (status === CuttingStatus.COMPLETED) {
    job.actualFinishDate = new Date();
    // Update linked order status
    await Order.findByIdAndUpdate(job.orderId, { status: OrderStatus.PENDING_DISPATCH });
  }

  await job.save();
  res.json(new ApiResponse(200, job, 'Progress updated'));
});