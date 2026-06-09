import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { ApiError } from '../utils/ApiError';

export const adminMiddleware = (req: AuthRequest, _res: Response, next: NextFunction) => {
  if (!req.user) {
    return next(new ApiError(401, 'Authentication required'));
  }

  const isAdmin = req.user.roles.includes('ADMIN');
  if (!isAdmin) {
    return next(new ApiError(403, 'Access denied. Administrator role required.'));
  }

  next();
};
