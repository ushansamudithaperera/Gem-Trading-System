import api from './api';

export interface Bid {
  _id: string;
  gem: {
    _id: string;
    title: string;
    price: number;
    weight: number;
    images: string[];
    gemType: string;
    status: string;
  };
  buyer: {
    _id: string;
    firstName: string;
    lastName: string;
    rating?: number;
  };
  seller: {
    _id: string;
    firstName: string;
    lastName: string;
    rating?: number;
    businessName?: string;
  };
  offeredPrice: number;
  status: 'Pending' | 'Accepted' | 'Rejected' | 'Cancelled';
  createdAt: string;
  updatedAt: string;
}

export const getBuyerBids = async (): Promise<Bid[]> => {
  const response = await api.get('/bids/buyer');
  return response.data.data;
};

export const getSellerBids = async (): Promise<Bid[]> => {
  const response = await api.get('/bids/seller');
  return response.data.data;
};

export const updateBidStatus = async (bidId: string, status: string): Promise<Bid> => {
  const response = await api.patch(`/bids/${bidId}/status`, { status });
  return response.data.data;
};
