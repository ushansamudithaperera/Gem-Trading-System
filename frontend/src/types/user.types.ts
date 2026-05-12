export type UserRole = 'ADMIN' | 'BUYER' | 'SELLER' | 'CUTTER';

export interface UserAddress {
  street?: string;
  city?: string;
  district?: string;
  province?: string;
  postalCode?: string;
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
  address?: UserAddress;
  rating: number;
  totalTransactions: number;
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