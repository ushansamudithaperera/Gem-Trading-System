import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware';
import { Order } from '../models/Order.model';
import { ApiError } from '../utils/ApiError';

/**
 * Middleware to check if the user is the buyer or seller of an order
 * Use in routes where only order participants can access
 */
export const checkOrderOwnership = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    const { id: orderId } = req.params;
    const userId = req.user._id.toString();

    const order = await Order.findById(orderId);
    if (!order) {
      return next(new ApiError(404, 'Order not found'));
    }

    const isBuyer = order.buyerId.toString() === userId;
    const isSeller = order.sellerId.toString() === userId;
    const isAdmin = req.user.roles.includes('ADMIN');

    if (!isBuyer && !isSeller && !isAdmin) {
      return next(
        new ApiError(403, 'Access denied. You are not a participant in this order')
      );
    }

    // Attach order and user type info to request
    req.order = order;
    req.isOrderBuyer = isBuyer;
    req.isOrderSeller = isSeller;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Convenience middleware to check if user is the SELLER of the order
 * Use for seller-only operations like updating tracking
 */
export const checkOrderSeller = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    const { id: orderId } = req.params;
    const userId = req.user._id.toString();

    const order = await Order.findById(orderId);
    if (!order) {
      return next(new ApiError(404, 'Order not found'));
    }

    const isSeller = order.sellerId.toString() === userId;
    const isAdmin = req.user.roles.includes('ADMIN');

    if (!isSeller && !isAdmin) {
      return next(
        new ApiError(403, 'Access denied. Only the seller can perform this action')
      );
    }

    req.order = order;
    req.isOrderSeller = true;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Convenience middleware to check if user is the BUYER of the order
 * Use for buyer-only operations like releasing escrow
 */
export const checkOrderBuyer = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new ApiError(401, 'Not authenticated'));
    }

    const { id: orderId } = req.params;
    const userId = req.user._id.toString();

    const order = await Order.findById(orderId);
    if (!order) {
      return next(new ApiError(404, 'Order not found'));
    }

    const isBuyer = order.buyerId.toString() === userId;
    const isAdmin = req.user.roles.includes('ADMIN');

    if (!isBuyer && !isAdmin) {
      return next(
        new ApiError(403, 'Access denied. Only the buyer can perform this action')
      );
    }

    req.order = order;
    req.isOrderBuyer = true;

    next();
  } catch (error) {
    next(error);
  }
};
