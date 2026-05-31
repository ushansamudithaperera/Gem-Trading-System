import mongoose, { Schema, Document } from 'mongoose';

// Job status progression through the cutting workflow
export enum JobStatus {
  PENDING_ACCEPTANCE = 'pending_acceptance',    // Buyer requested, awaiting cutter acceptance
  STONE_RECEIVED = 'stone_received',            // Cutter received the rough stone
  PRE_FORMING = 'pre_forming',                  // Initial shaping/planning stage
  FACETING = 'faceting',                        // Creating facets on the stone
  POLISHED = 'polished',                        // Final polishing stage
  READY_TO_SHIP = 'ready_to_ship',              // Cutting complete, ready for shipment
  COMPLETED = 'completed',                      // Order closed/completed
}

// Legacy enum for backward compatibility
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
  gemId: mongoose.Types.ObjectId;              // The gem being cut
  agreedPrice: number;                         // Price agreed between buyer and cutter
  jobStatus: JobStatus;                        // Detailed job status (replaces status)
  status?: CuttingStatus;                      // Legacy field for backward compatibility
  instructions: string;
  expectedWeightCarats?: number;
  actualWeightCarats?: number;
  expectedFinishDate: Date;
  actualFinishDate?: Date;
  progressImages: string[];                    // Updated during cutting
  notes?: string;                              // Cutter notes during process
  createdAt: Date;
  updatedAt: Date;
}

const CuttingJobSchema = new Schema<ICuttingJob>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    cutterId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    gemId: { type: Schema.Types.ObjectId, ref: 'Gem', required: true },
    agreedPrice: { type: Number, required: true, min: 0 },
    jobStatus: {
      type: String,
      enum: Object.values(JobStatus),
      default: JobStatus.PENDING_ACCEPTANCE,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(CuttingStatus),
      default: CuttingStatus.PENDING,
      index: true,
    },
    instructions: { type: String, required: true },
    expectedWeightCarats: { type: Number },
    actualWeightCarats: { type: Number },
    expectedFinishDate: { type: Date, required: true },
    actualFinishDate: { type: Date },
    progressImages: [{ type: String }], // Cloudinary URLs
    notes: { type: String },
  },
  { timestamps: true }
);

CuttingJobSchema.index({ cutterId: 1, jobStatus: 1, createdAt: -1 });
CuttingJobSchema.index({ buyerId: 1, jobStatus: 1, createdAt: -1 });
CuttingJobSchema.index({ expectedFinishDate: 1 });
CuttingJobSchema.index({ 'jobStatus': 1, 'expectedFinishDate': 1 });

export const CuttingJob = mongoose.model<ICuttingJob>('CuttingJob', CuttingJobSchema);