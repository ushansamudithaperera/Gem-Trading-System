import mongoose, { Schema, Document } from 'mongoose';

export enum DisputeReason {
  NOT_RECEIVED = 'NOT_RECEIVED',
  ITEM_MISMATCH = 'ITEM_MISMATCH',
  DAMAGED = 'DAMAGED',
  CUTTING_QUALITY = 'CUTTING_QUALITY',
  OTHER = 'OTHER',
}

export enum DisputeStatus {
  OPEN = 'OPEN',
  UNDER_REVIEW = 'UNDER_REVIEW',
  RESOLVED_BUYER = 'RESOLVED_BUYER',
  RESOLVED_SELLER = 'RESOLVED_SELLER',
  CLOSED = 'CLOSED',
}

export interface IDispute extends Document {
  orderId: mongoose.Types.ObjectId;
  raisedBy: mongoose.Types.ObjectId; // User ID (buyer or seller)
  reason: DisputeReason;
  description: string;
  evidenceImages: string[];
  status: DisputeStatus;
  adminResolution?: string;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DisputeSchema = new Schema<IDispute>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    raisedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, enum: Object.values(DisputeReason), required: true },
    description: { type: String, required: true },
    evidenceImages: [{ type: String }],
    status: {
      type: String,
      enum: Object.values(DisputeStatus),
      default: DisputeStatus.OPEN,
      index: true,
    },
    adminResolution: { type: String },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

DisputeSchema.index({ status: 1, createdAt: 1 });

export const Dispute = mongoose.model<IDispute>('Dispute', DisputeSchema);