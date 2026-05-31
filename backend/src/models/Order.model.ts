import mongoose, { Schema, Document } from 'mongoose';

export enum OrderStatus {
  PENDING_DISPATCH = 'PENDING_DISPATCH',
  IN_CUTTING_PROCESS = 'IN_CUTTING_PROCESS',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DISPUTED = 'DISPUTED',
  RETURN_REQUESTED = 'RETURN_REQUESTED',
}

export enum EscrowStatus {
  HELD = 'HELD',
  RELEASED = 'RELEASED',
  REFUNDED = 'REFUNDED',
}

export interface IOrder extends Document {
  orderNumber: string;
  buyerId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  cutterId?: mongoose.Types.ObjectId; // If cutting service is involved
  gemId: mongoose.Types.ObjectId;
  amount: number; // Total amount
  adminFee: number; // Platform fee (e.g., 5%)
  sellerAmount: number;
  cutterAmount?: number;
  status: OrderStatus;
  escrowStatus: EscrowStatus;
  stripePaymentIntentId?: string;
  deliveryInfo: {
    courierCompany?: string;
    trackingNumber?: string;
    shippedAt?: Date;
    deliveredAt?: Date;
    autoReleaseDate?: Date; // When auto-release timer will fire
    status?: 'pending' | 'in_transit' | 'delivered' | 'failed';
  };
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      default: () => `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 8)}`,
    },
    buyerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    sellerId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    cutterId: { type: Schema.Types.ObjectId, ref: 'User' },
    gemId: { type: Schema.Types.ObjectId, ref: 'Gem', required: true },
    amount: { type: Number, required: true, min: 0 },
    adminFee: { type: Number, required: true, min: 0 },
    sellerAmount: { type: Number, required: true, min: 0 },
    cutterAmount: { type: Number, min: 0 },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING_DISPATCH,
      index: true,
    },
    escrowStatus: {
      type: String,
      enum: Object.values(EscrowStatus),
      default: EscrowStatus.HELD,
    },
    stripePaymentIntentId: { type: String, sparse: true },
    deliveryInfo: {
      courierCompany: String,
      trackingNumber: String,
      shippedAt: Date,
      deliveredAt: Date,
      autoReleaseDate: Date,
      status: { type: String, enum: ['pending', 'in_transit', 'delivered', 'failed'] },
    },
    cancellationReason: { type: String },
  },
  { timestamps: true }
);

// Indexes for dashboard queries
OrderSchema.index({ buyerId: 1, status: 1, createdAt: -1 });
OrderSchema.index({ sellerId: 1, status: 1 });
OrderSchema.index({ 'deliveryInfo.autoReleaseDate': 1 }); // For timer jobs

export const Order = mongoose.model<IOrder>('Order', OrderSchema);