export type OrderStatus =
  | 'PENDING_DISPATCH'
  | 'IN_CUTTING_PROCESS'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED'
  | 'RETURN_REQUESTED';

export type EscrowStatus = 'HELD' | 'RELEASED' | 'REFUNDED';

export interface DeliveryInfo {
  courierCompany?: string;
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  autoReleaseDate?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  buyerId: { _id: string; firstName: string; lastName: string; email: string };
  sellerId: { _id: string; firstName: string; lastName: string; businessName?: string };
  cutterId?: { _id: string; firstName: string; lastName: string };
  gemId: { _id: string; title: string; images: string[]; type: string; weightCarats: number };
  amount: number;
  adminFee: number;
  sellerAmount: number;
  cutterAmount?: number;
  status: OrderStatus;
  escrowStatus: EscrowStatus;
  deliveryInfo: DeliveryInfo;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  gemId: string;
  amount: number;
}