import mongoose, { Schema, Document } from 'mongoose';

/**
 * DisputeReason - Reasons why a buyer or seller opens a dispute
 */
export enum DisputeReason {
  NOT_RECEIVED = 'NOT_RECEIVED',
  ITEM_MISMATCH = 'ITEM_MISMATCH',
  DAMAGED = 'DAMAGED',
  CUTTING_QUALITY = 'CUTTING_QUALITY',
  OTHER = 'OTHER',
}

/**
 * DisputeStatus - Dispute lifecycle status
 */
export enum DisputeStatus {
  OPEN = 'OPEN',
  UNDER_REVIEW = 'UNDER_REVIEW',
  RESOLVED_BUYER = 'RESOLVED_BUYER',
  RESOLVED_SELLER = 'RESOLVED_SELLER',
  CLOSED = 'CLOSED',
}

export interface IDispute extends Document {
  orderId: mongoose.Types.ObjectId;
  raisedBy: mongoose.Types.ObjectId;
  against: mongoose.Types.ObjectId;
  reason: string;
  description: string;
  evidenceUrls: string[];
  status: 'Open' | 'Under Review' | 'Resolved' | 'OPEN' | 'UNDER_REVIEW' | 'RESOLVED' | 'RESOLVED_BUYER' | 'RESOLVED_SELLER' | 'CLOSED';
  adminDecision?: string;
  adminResolution?: string;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DisputeSchema = new Schema<IDispute>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    raisedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    against: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reason: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
      default: 'Order dispute raised.',
    },
    evidenceUrls: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['Open', 'Under Review', 'Resolved', 'OPEN', 'UNDER_REVIEW', 'RESOLVED', 'RESOLVED_BUYER', 'RESOLVED_SELLER', 'CLOSED'],
      default: 'Open',
      index: true,
    },
    adminDecision: {
      type: String,
    },
    adminResolution: {
      type: String,
    },
    resolvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      sparse: true,
    },
    resolvedAt: {
      type: Date,
      sparse: true,
    },
  },
  { timestamps: true }
);

DisputeSchema.index({ status: 1, createdAt: -1 });
DisputeSchema.index({ orderId: 1, status: 1 });
DisputeSchema.index({ raisedBy: 1, createdAt: -1 });

export const Dispute = mongoose.model<IDispute>('Dispute', DisputeSchema);