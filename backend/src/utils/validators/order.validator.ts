import { z } from 'zod';

// Create order validation
export const createOrderSchema = z.object({
  body: z.object({
    gemId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid gem ID'),
    amount: z.number().positive('Amount must be positive'),
  }),
});

// Cancel order validation
export const cancelOrderSchema = z.object({
  params: z.object({
    orderId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid order ID'),
  }),
});

// Escrow release validation
export const releaseEscrowSchema = z.object({
  params: z.object({
    orderId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid order ID'),
  }),
});

// Refund validation
export const refundEscrowSchema = z.object({
  params: z.object({
    orderId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid order ID'),
  }),
  body: z.object({
    reason: z.string().min(1, 'Reason required'),
  }),
});

// Hire cutter validation
export const hireCutterSchema = z.object({
  body: z.object({
    orderId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid order ID'),
    cutterId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid cutter ID'),
    instructions: z.string().min(1, 'Instructions required'),
    expectedFinishDate: z.string().datetime(),
    cutterFee: z.number().positive('Cutter fee must be positive'),
  }),
});

// Update cutting progress validation
export const updateCuttingProgressSchema = z.object({
  params: z.object({
    jobId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid job ID'),
  }),
  body: z.object({
    progressImages: z.array(z.string().url()).optional(),
    status: z.enum(['ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED']).optional(),
  }),
});

// Open dispute validation
export const openDisputeSchema = z.object({
  body: z.object({
    orderId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid order ID'),
    reason: z.enum(['NOT_RECEIVED', 'ITEM_MISMATCH', 'DAMAGED', 'CUTTING_QUALITY', 'OTHER']),
    description: z.string().min(1, 'Description required'),
    evidenceImages: z.array(z.string().url()).optional(),
  }),
});

// Resolve dispute validation (admin)
export const resolveDisputeSchema = z.object({
  params: z.object({
    disputeId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid dispute ID'),
  }),
  body: z.object({
    resolution: z.string().min(1, 'Resolution required'),
    decision: z.enum(['BUYER', 'SELLER']),
  }),
});

// Webhook courier delivered validation
export const courierDeliveredSchema = z.object({
  body: z.object({
    orderNumber: z.string().min(1),
    trackingNumber: z.string().optional(),
    deliveredAt: z.string().datetime().optional(),
  }),
});