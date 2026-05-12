import { z } from 'zod';

// User registration validation
export const registerSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    phone: z.string().optional(),
    roles: z.array(z.enum(['BUYER', 'SELLER', 'CUTTER'])).optional(),
  }),
});

// User login validation
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

// User profile update validation
export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(1).optional(),
    lastName: z.string().min(1).optional(),
    phone: z.string().optional(),
    avatar: z.string().url().optional(),
    businessName: z.string().optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      district: z.string().optional(),
      province: z.string().optional(),
      postalCode: z.string().optional(),
    }).optional(),
  }),
});

// Change password validation
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  }),
});