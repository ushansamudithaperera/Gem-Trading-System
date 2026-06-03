import mongoose, { Schema, Document } from 'mongoose';

export interface IGemstone extends Document {
  title: string;
  price: number;
  weight: number;
  gemType: string;
  shape?: string;
  color?: string;
  clarity?: string;
  treatment?: string;
  lab?: string;
  reportNumber?: string;
  description?: string;
  images: string[];
  seller: mongoose.Types.ObjectId;
  status: 'Active' | 'Sold';
  createdAt: Date;
  updatedAt: Date;
}

const GemstoneSchema = new Schema<IGemstone>(
  {
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    weight: { type: Number, required: true, min: 0.01 },
    gemType: { type: String, required: true },
    shape: { type: String },
    color: { type: String },
    clarity: { type: String },
    treatment: { type: String },
    lab: { type: String },
    reportNumber: { type: String },
    description: { type: String },
    images: [{ type: String }],
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: ['Active', 'Sold'], default: 'Active', index: true },
  },
  { timestamps: true }
);

export const Gemstone = mongoose.model<IGemstone>('Gemstone', GemstoneSchema);
