import mongoose, { Schema, Document } from 'mongoose';

/**
 * DisputeReason - Reasons why a buyer or seller opens a dispute
 */
export enum DisputeReason {
  NOT_RECEIVED = 'NOT_RECEIVED',           // Gem not received
  ITEM_MISMATCH = 'ITEM_MISMATCH',         // Gem doesn't match description
  DAMAGED = 'DAMAGED',                     // Gem arrived damaged
  CUTTING_QUALITY = 'CUTTING_QUALITY',     // Quality issue from cutting service
  OTHER = 'OTHER',                         // Other reason
}

/**
 * DisputeStatus - Dispute lifecycle status
 */
export enum DisputeStatus {
  OPEN = 'OPEN',                           // Newly opened dispute
  UNDER_REVIEW = 'UNDER_REVIEW',           // Admin reviewing evidence
  RESOLVED_BUYER = 'RESOLVED_BUYER',       // Resolved in favor of buyer
  RESOLVED_SELLER = 'RESOLVED_SELLER',     // Resolved in favor of seller
  CLOSED = 'CLOSED',                       // Closed/archived
}

/**
 * IDispute - Dispute document interface
 * Represents a dispute between buyer and seller on an order
 */
export interface IDispute extends Document {
  orderId: mongoose.Types.ObjectId;        // Reference to Order
  raisedBy: mongoose.Types.ObjectId;       // User ID who raised dispute (buyer or seller)
  reason: DisputeReason;                   // Category of dispute
  description: string;                     // Detailed description of the issue
  evidenceUrls: string[];                  // S3/Cloudinary URLs for evidence (images, documents)
  status: DisputeStatus;                   // Current dispute status
  adminResolution?: string;                // Admin notes on resolution
  resolvedBy?: mongoose.Types.ObjectId;    // Admin user who resolved (if applicable)
  resolvedAt?: Date;                       // When dispute was resolved
  createdAt: Date;                         // When dispute was opened
  updatedAt: Date;                         // Last update timestamp
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
    reason: {
      type: String,
      enum: Object.values(DisputeReason),
      required: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 2000,
    },
    evidenceUrls: {
      type: [String],
      default: [],
      validate: {
        validator: function (v: string[]) {
          return v.length <= 10; // Max 10 evidence files
        },
        message: 'Maximum 10 evidence URLs allowed',
      },
    },
    status: {
      type: String,
      enum: Object.values(DisputeStatus),
      default: DisputeStatus.OPEN,
      index: true,
    },
    adminResolution: {
      type: String,
      maxlength: 2000,
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

// Indexes for fast queries
DisputeSchema.index({ status: 1, createdAt: -1 });
DisputeSchema.index({ orderId: 1, status: 1 });
DisputeSchema.index({ raisedBy: 1, createdAt: -1 });
DisputeSchema.index({ resolvedAt: 1 });

export const Dispute = mongoose.model<IDispute>('Dispute', DisputeSchema);