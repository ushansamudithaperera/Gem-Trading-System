export type UserRole = 'ADMIN' | 'BUYER' | 'SELLER' | 'CUTTER';

export interface UserAddress {
  street?: string;
  city?: string;
  district?: string;
  province?: string;
  postalCode?: string;
}

export interface UserKYC {
  documentUrls: string[];
  status: 'unverified' | 'pending' | 'verified' | 'rejected';
  submittedAt?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

export interface LapidaryProfile {
  description?: string;
  location?: string;
  avgTurnaroundDays?: number;
  specialties?: string[];
  portfolio?: string[];
}

export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  roles: UserRole[];
  isEmailVerified: boolean;
  businessName?: string;
  businessRegNo?: string;
  stripeConnectAccountId?: string;
  address?: UserAddress;
  rating: number;
  totalTransactions: number;
  kyc?: UserKYC;
  lapidaryProfile?: LapidaryProfile;
  createdAt: string;
  updatedAt: string;
}

export interface UserRegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roles?: UserRole[];
}

export interface UserLoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}