import mongoose, { Schema, Document } from 'mongoose';

export enum CuttingStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface ICuttingJob extends Document {
  orderId: mongoose.Types.ObjectId;
  buyerId: mongoose.Types.ObjectId;
  cutterId: mongoose.Types.ObjectId;
  roughGemId: mongoose.Types.ObjectId;
  instructions: string;
  expectedWeightCarats?: number;
  actualWeightCarats?: number;
  expectedFinishDate: Date;
  actualFinishDate?: Date;
  status: CuttingStatus;
  progressImages: string[]; // Updated during cutting
  cutterFee: number;
  createdAt: Date;
  updatedAt: Date;
}

const CuttingJobSchema = new Schema<ICuttingJob>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    cutterId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    roughGemId: { type: Schema.Types.ObjectId, ref: 'Gem', required: true },
    instructions: { type: String, required: true },
    expectedWeightCarats: { type: Number },
    actualWeightCarats: { type: Number },
    expectedFinishDate: { type: Date, required: true },
    actualFinishDate: { type: Date },
    status: {
      type: String,
      enum: Object.values(CuttingStatus),
      default: CuttingStatus.PENDING,
      index: true,
    },
    progressImages: [{ type: String }], // Cloudinary URLs
    cutterFee: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

CuttingJobSchema.index({ cutterId: 1, status: 1 });
CuttingJobSchema.index({ expectedFinishDate: 1 });

export const CuttingJob = mongoose.model<ICuttingJob>('CuttingJob', CuttingJobSchema);