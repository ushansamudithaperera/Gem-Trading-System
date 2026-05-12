import { Document, Types } from 'mongoose';

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

export interface IDeliveryInfo {
  courierCompany?: string;
  trackingNumber?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  autoReleaseDate?: Date;
}

export interface IOrderBase {
  orderNumber: string;
  buyerId: Types.ObjectId;
  sellerId: Types.ObjectId;
  cutterId?: Types.ObjectId;
  gemId: Types.ObjectId;
  amount: number;
  adminFee: number;
  sellerAmount: number;
  cutterAmount?: number;
  status: OrderStatus;
  escrowStatus: EscrowStatus;
  stripePaymentIntentId?: string;
  deliveryInfo: IDeliveryInfo;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrder extends IOrderBase, Document {}

// For order creation input
export interface IOrderInput {
  gemId: string;
  amount: number;
}

// For order response with populated references
export interface IOrderPopulated extends Omit<IOrderBase, 'buyerId' | 'sellerId' | 'cutterId' | 'gemId'> {
  buyerId: { _id: string; firstName: string; lastName: string; email: string };
  sellerId: { _id: string; firstName: string; lastName: string; businessName?: string };
  cutterId?: { _id: string; firstName: string; lastName: string };
  gemId: { _id: string; title: string; images: string[]; type: string };
}