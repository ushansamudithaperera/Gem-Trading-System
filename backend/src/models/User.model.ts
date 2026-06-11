import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Define User Roles (Dynamic Array)
export const UserRoles = ['ADMIN', 'BUYER', 'SELLER', 'CUTTER'] as const;
export type UserRole = typeof UserRoles[number];

// Default role for new users
export const DEFAULT_ROLES: UserRole[] = ['BUYER'];

// KYC Status enum
export enum KYCStatus {
  UNVERIFIED = 'unverified',
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

// KYC interface
export interface IKYC {
  documentUrls: string[]; // S3/Cloudinary URLs
  status: KYCStatus;
  submittedAt?: Date;
  reviewedAt?: Date;
  rejectionReason?: string; // Reason for rejection if status is 'rejected'
}

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string; // Cloudinary URL
  roles: UserRole[];
  isEmailVerified: boolean;
  businessName?: string; // For sellers/cutters
  businessRegNo?: string;
  stripeConnectAccountId?: string; // For sellers to receive payments
  kyc: IKYC; // Know Your Customer verification
  companyName?: string;
  profilePicture?: string;
  kycStatus: 'Unverified' | 'Pending' | 'Verified';
  kycDetails?: {
    documentType?: string;
    idNumber?: string;
    dob?: string;
    documentUrls: string[];
  };
  is2FAEnabled: boolean;
  address?: {
    street: string;
    city: string;
    district: string;
    province: string;
    postalCode: string;
  };
  rating: number; // Average rating (from completed orders)
  totalTransactions: number;
  availableBalance: number;
  escrowBalance: number;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false, // Don't return password by default
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    avatar: { type: String },
    roles: {
      type: [String],
      enum: UserRoles,
      default: DEFAULT_ROLES,
      index: true,
    },
    isEmailVerified: { type: Boolean, default: false },
    businessName: { type: String, trim: true },
    businessRegNo: { type: String, trim: true },
    stripeConnectAccountId: { type: String, sparse: true },
    companyName: { type: String, trim: true },
    profilePicture: { type: String },
    kycStatus: {
      type: String,
      enum: ['Unverified', 'Pending', 'Verified'],
      default: 'Unverified',
      index: true,
    },
    kycDetails: {
      documentType: { type: String },
      idNumber: { type: String },
      dob: { type: String },
      documentUrls: { type: [String], default: [] },
    },
    is2FAEnabled: { type: Boolean, default: false },
    kyc: {
      documentUrls: {
        type: [String],
        default: [],
        validate: {
          validator: function (v: string[]) {
            return v.length <= 10; // Max 10 documents
          },
          message: 'Maximum 10 KYC documents allowed',
        },
      },
      status: {
        type: String,
        enum: Object.values(KYCStatus),
        default: KYCStatus.UNVERIFIED,
        index: true,
      },
      submittedAt: { type: Date, sparse: true },
      reviewedAt: { type: Date, sparse: true },
      rejectionReason: { type: String, maxlength: 500 },
    },
    address: {
      street: String,
      city: String,
      district: String,
      province: String,
      postalCode: String,
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalTransactions: { type: Number, default: 0 },
    availableBalance: { type: Number, default: 0 },
    escrowBalance: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Compound index for role-based queries
UserSchema.index({ roles: 1, rating: -1 });
UserSchema.index({ email: 1 }, { unique: true });
// KYC indexes for pending review queries
UserSchema.index({ 'kyc.status': 1, 'kyc.submittedAt': -1 });
UserSchema.index({ roles: 1, 'kyc.status': 1 });

export const User = mongoose.model<IUser>('User', UserSchema);