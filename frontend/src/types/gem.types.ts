export type GemType = 'ROUGH' | 'POLISHED';
export type GemStatus = 'AVAILABLE' | 'SOLD' | 'UNDER_CUTTING' | 'LISTED';

export interface Gem {
  _id: string;
  sellerId: {
    _id: string;
    firstName: string;
    lastName: string;
    rating: number;
    businessName?: string;
  };
  title: string;
  description: string;
  type: GemType;
  weightCarats: number;
  images: string[];
  price: number;
  status: GemStatus;
  location: string;
  certificate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GemInput {
  title: string;
  description: string;
  type: GemType;
  weightCarats: number;
  images: File[] | string[];
  price: number;
  location: string;
  certificate?: string;
}

export interface MarketplaceFilters {
  type?: GemType | '';
  minPrice?: number | '';
  maxPrice?: number | '';
  minWeight?: number | '';
  maxWeight?: number | '';
  location?: string;
  page?: number;
  limit?: number;
}