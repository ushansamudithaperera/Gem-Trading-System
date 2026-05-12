import { Document, Types } from 'mongoose';

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

export interface IGemBase {
  sellerId: Types.ObjectId;
  title: string;
  description: string;
  type: GemType;
  weightCarats: number;
  images: string[];
  price: number;
  status: GemStatus;
  location: string;
  certificate?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGem extends IGemBase, Document {}

// For marketplace listing response (with populated seller)
export interface IGemPopulated extends Omit<IGemBase, 'sellerId'> {
  sellerId: {
    _id: string;
    firstName: string;
    lastName: string;
    rating: number;
    businessName?: string;
  };
}

// For create/update input
export interface IGemInput {
  title: string;
  description: string;
  type: GemType;
  weightCarats: number;
  images: string[];
  price: number;
  location: string;
  certificate?: string;
}