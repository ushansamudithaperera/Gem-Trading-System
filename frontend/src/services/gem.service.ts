import api from './api';
import { GemType, GemStatus } from '../types/gem.types';

export interface Gem {
  _id: string;
  title: string;
  description: string;
  type: GemType;
  weightCarats: number;
  images: string[];
  price: number;
  status: GemStatus;
  location: string;
  certificate?: string;
  sellerId: {
    _id: string;
    firstName: string;
    lastName: string;
    rating: number;
    businessName?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MarketplaceFilters {
  type?: string;
  minPrice?: number | '';
  maxPrice?: number | '';
  minWeight?: number | '';
  maxWeight?: number | '';
  location?: string;
  page?: number;
  limit?: number;
}

export const getMarketplace = async (filters: MarketplaceFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== undefined && value !== null) {
      params.append(key, String(value));
    }
  });
  const response = await api.get(`/gems/marketplace?${params.toString()}`);
  return response.data.data;
};

export const getGemById = async (id: string): Promise<Gem> => {
  const response = await api.get(`/gems/${id}`);
  return response.data.data;
};

export const createGem = async (data: FormData | any) => {
  const response = await api.post('/gems', data);
  return response.data.data;
};

export const getSellerGems = async () => {
  const response = await api.get('/gems/seller/list');
  return response.data.data;
};

export const getSellerStats = async () => {
  const response = await api.get('/gems/seller/stats');
  return response.data.data;
};