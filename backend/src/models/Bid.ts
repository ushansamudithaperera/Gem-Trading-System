import mongoose, { Schema, Document } from 'mongoose';

export interface IBid extends Document {
  gem: mongoose.Types.ObjectId;
  buyer: mongoose.Types.ObjectId;
  seller: mongoose.Types.ObjectId;
  offeredPrice: number;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const BidSchema = new Schema<IBid>(
  {
    gem: { type: Schema.Types.ObjectId, ref: 'Gemstone', required: true, index: true },
    buyer: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    seller: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    offeredPrice: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Cancelled'],
      default: 'Pending',
      index: true,
    },
  },
  { timestamps: true }
);

export const Bid = mongoose.model<IBid>('Bid', BidSchema);
