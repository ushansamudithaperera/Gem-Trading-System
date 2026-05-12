import { Order, OrderStatus, EscrowStatus } from '../models/Order.model';
import { EscrowService } from '../services/escrow.service';
import { logger } from '../config/logger';


// In-memory timer store (for demo; production should use Bull/BullMQ with Redis)
const timers = new Map<string, NodeJS.Timeout>();

/**
 * Schedule auto-release timer for a delivered order.
 * Timer will release escrow after N days unless order is disputed.
 */
export const scheduleAutoRelease = (orderId: string, autoReleaseDate: Date): void => {
  // Clear existing timer if any
  if (timers.has(orderId)) {
    clearTimeout(timers.get(orderId)!);
    timers.delete(orderId);
  }

  const now = Date.now();
  const delay = autoReleaseDate.getTime() - now;

  if (delay <= 0) {
    logger.warn(`Auto-release date for order ${orderId} is in the past, releasing immediately`);
    executeAutoRelease(orderId);
    return;
  }

  const timeout = setTimeout(async () => {
    await executeAutoRelease(orderId);
    timers.delete(orderId);
  }, delay);

  timers.set(orderId, timeout);
  logger.info(`Scheduled auto-release for order ${orderId} in ${delay}ms (${new Date(now + delay).toISOString()})`);
};

/**
 * Cancel scheduled auto-release (e.g., when dispute is opened or order is cancelled)
 */
export const cancelAutoRelease = (orderId: string): void => {
  if (timers.has(orderId)) {
    clearTimeout(timers.get(orderId)!);
    timers.delete(orderId);
    logger.info(`Cancelled auto-release for order ${orderId}`);
  }
};

/**
 * Execute the auto-release logic
 */
const executeAutoRelease = async (orderId: string): Promise<void> => {
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      logger.error(`Auto-release: Order ${orderId} not found`);
      return;
    }

    // Only proceed if order is still DELIVERED and escrow still HELD
    if (order.status !== OrderStatus.DELIVERED || order.escrowStatus !== EscrowStatus.HELD) {
      logger.info(`Auto-release skipped for order ${orderId}: status=${order.status}, escrow=${order.escrowStatus}`);
      return;
    }

    logger.info(`Auto-releasing escrow for order ${orderId}`);
    
    // Release funds to seller (and cutter if applicable)
    const success = await EscrowService.releaseFunds(
      orderId,
      order.sellerId.toString(),
      order.sellerAmount,
      order.cutterId?.toString(),
      order.cutterAmount
    );

    if (success) {
      order.escrowStatus = EscrowStatus.RELEASED;
      order.status = OrderStatus.COMPLETED;
      await order.save();
      logger.info(`Auto-release completed for order ${orderId}`);
    } else {
      logger.error(`Auto-release failed for order ${orderId}`);
    }
  } catch (error) {
    logger.error(`Auto-release error for order ${orderId}: ${error}`);
  }
};

/**
 * Reschedule auto-release (e.g., after dispute resolved in seller's favor)
 */
export const rescheduleAutoRelease = async (orderId: string): Promise<void> => {
  const order = await Order.findById(orderId);
  if (order && order.deliveryInfo.autoReleaseDate) {
    scheduleAutoRelease(orderId, order.deliveryInfo.autoReleaseDate);
  }
};