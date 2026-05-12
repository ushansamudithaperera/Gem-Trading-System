import { Document } from 'mongoose';

export interface IUserAddress {
  street?: string;
  city?: string;
  district?: string;
  province?: string;
  postalCode?: string;
}

export type UserRole = 'ADMIN' | 'BUYER' | 'SELLER' | 'CUTTER';

export interface IUserBase {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  roles: UserRole[];
  isEmailVerified: boolean;
  businessName?: string;
  businessRegNo?: string;
  address?: IUserAddress;
  rating: number;
  totalTransactions: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUser extends IUserBase, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// For response (without sensitive fields)
export interface IUserResponse extends Omit<IUserBase, 'password'> {
  id: string;
}

// For registration input
export interface IUserRegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roles?: UserRole[];
}