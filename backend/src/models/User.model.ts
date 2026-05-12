import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

// Define User Roles (Dynamic Array)
export const UserRoles = ['ADMIN', 'BUYER', 'SELLER', 'CUTTER'] as const;
export type UserRole = typeof UserRoles[number];

// Default role for new users
export const DEFAULT_ROLES: UserRole[] = ['BUYER'];

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
  address?: {
    street: string;
    city: string;
    district: string;
    province: string;
    postalCode: string;
  };
  rating: number; // Average rating (from completed orders)
  totalTransactions: number;
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
    address: {
      street: String,
      city: String,
      district: String,
      province: String,
      postalCode: String,
    },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalTransactions: { type: Number, default: 0 },
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

export const User = mongoose.model<IUser>('User', UserSchema);