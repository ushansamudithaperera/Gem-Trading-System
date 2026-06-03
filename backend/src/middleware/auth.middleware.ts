import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model';
import { env } from '../config/env';
import { IOrder } from '../models/Order.model';
import { ICuttingJob } from '../models/CuttingJob.model';

import { ApiError } from '../utils/ApiError';

export interface AuthRequest extends Request {
  user?: any;
  // Order-related properties
  order?: IOrder;
  isOrderBuyer?: boolean;
  isOrderSeller?: boolean;
  // Cutting job-related properties
  cuttingJob?: ICuttingJob;
  isCuttingJobBuyer?: boolean;
  isCuttingJobCutter?: boolean;
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      throw new ApiError(401, 'Authentication token missing');
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string };
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        message: 'Session expired. Please log in again.',
        code: 'TOKEN_EXPIRED',
      });
      return;
    }
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({
        message: 'Invalid token',
      });
      return;
    }
    next(error);
  }
};