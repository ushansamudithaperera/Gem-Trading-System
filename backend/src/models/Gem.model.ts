import mongoose, { Schema, Document } from 'mongoose';

export enum GemType {
  ROUGH = 'ROUGH',
  POLISHED = 'POLISHED',
}

export enum GemStatus {
  AVAILABLE = 'AVAILABLE',
  SOLD = 'SOLD',
  UNDER_CUTTING = 'UNDER_CUTTING',
  LISTED = 'LISTED',
}

export interface IGem extends Document {
  sellerId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  type: GemType;
  weightCarats: number;
  images: string[]; // Cloudinary URLs
  price: number; // Listed price or minimum bid price
  status: GemStatus;
  location: string; // Mining or current location
  certificate?: string; // Certification URL or number
  createdAt: Date;
  updatedAt: Date;
}

const GemSchema = new Schema<IGem>(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    type: { type: String, enum: Object.values(GemType), required: true },
    weightCarats: { type: Number, required: true, min: 0.01 },
    images: [{ type: String, required: true }],
    price: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: Object.values(GemStatus),
      default: GemStatus.AVAILABLE,
      index: true,
    },
    location: { type: String, required: true },
    certificate: { type: String },
  },
  { timestamps: true }
);

// Indexes for marketplace filtering and seller inventory
GemSchema.index({ type: 1, status: 1, price: -1 });
GemSchema.index({ weightCarats: 1 });
// Index for efficient seller inventory queries
GemSchema.index({ sellerId: 1, status: 1 });
// Index for seller stats aggregations
GemSchema.index({ sellerId: 1, createdAt: -1 });

export const Gem = mongoose.model<IGem>('Gem', GemSchema);