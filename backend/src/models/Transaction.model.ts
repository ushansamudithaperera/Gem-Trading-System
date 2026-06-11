import mongoose, { Schema, Document } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  amount: number;
  type: 'escrow_credit' | 'escrow_release' | 'payout_bank' | 'payment' | 'refund' | string;
  status: 'Pending' | 'Completed' | 'Failed';
  description: string;
  orderId?: mongoose.Types.ObjectId;
  jobId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['Pending', 'Completed', 'Failed'],
      default: 'Completed',
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
    },
    jobId: {
      type: Schema.Types.ObjectId,
      ref: 'CuttingJob',
    },
  },
  { timestamps: true }
);

// Indexes for fast wallet queries
TransactionSchema.index({ userId: 1, createdAt: -1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', TransactionSchema);
