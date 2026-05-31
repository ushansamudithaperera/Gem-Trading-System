import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { ApiError } from '../utils/ApiError';
import { UserRole } from '../models/User.model';

export const roleMiddleware = (allowedRoles: UserRole[]) => {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    const hasRole = req.user.roles.some((role: UserRole) => allowedRoles.includes(role));
    
    if (!hasRole) {
      return next(new ApiError(403, `Access denied. Required roles: ${allowedRoles.join(', ')}`));
    }
    
    next();
  };
};

// Convenience middlewares
export const isAdmin = roleMiddleware(['ADMIN']);
export const isSeller = roleMiddleware(['SELLER', 'ADMIN']);
export const isSellerOrCutter = roleMiddleware(['SELLER', 'CUTTER', 'ADMIN']);
export const isBuyer = roleMiddleware(['BUYER', 'ADMIN']);
export const isCutter = roleMiddleware(['CUTTER', 'ADMIN']);