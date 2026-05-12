import { Order, EscrowStatus, OrderStatus } from '../models/Order.model';
import { logger } from '../config/logger';


// Mock escrow service - in production, integrate with Stripe Connect
export class EscrowService {
  /**
   * Hold funds in escrow when order is created
   * In production: Create Stripe PaymentIntent with capture_method='manual'
   */
  static async holdFunds(orderId: string, amount: number, _customerId?: string): Promise<string> {
    logger.info(`[Escrow] Holding ${amount} for order ${orderId}`);
    // Mock: return mock payment intent ID
    return `mock_pi_${orderId}_${Date.now()}`;
  }

  /**
   * Release funds to seller (and cutter if applicable)
   */
  static async releaseFunds(orderId: string, sellerId: string, sellerAmount: number, cutterId?: string, cutterAmount?: number): Promise<boolean> {
    logger.info(`[Escrow] Releasing ${sellerAmount} to seller ${sellerId}${cutterAmount ? ` and ${cutterAmount} to cutter ${cutterId}` : ''}`);
    
    // In production: create Stripe transfers
    // await stripe.transfers.create({ amount: sellerAmount, currency: 'lkr', destination: sellerAccountId });
    
    await Order.findByIdAndUpdate(orderId, { escrowStatus: EscrowStatus.RELEASED });
    return true;
  }

  /**
   * Refund entire amount to buyer
   */
  static async refundFunds(orderId: string, buyerId: string, amount: number): Promise<boolean> {
    logger.info(`[Escrow] Refunding ${amount} to buyer ${buyerId} for order ${orderId}`);
    
    // In production: create refund
    // await stripe.refunds.create({ payment_intent: paymentIntentId });
    
    await Order.findByIdAndUpdate(orderId, { escrowStatus: EscrowStatus.REFUNDED });
    return true;
  }

  /**
   * Schedule auto-release timer (called when order is delivered)
   */
  static scheduleAutoRelease(orderId: string, autoReleaseDate: Date): void {
    const delay = autoReleaseDate.getTime() - Date.now();
    if (delay <= 0) return;
    
    logger.info(`[Escrow] Auto-release scheduled for order ${orderId} in ${delay}ms`);
    
    // In production: use job queue (Bull/BullMQ) or setTimeout (not scalable)
    // For free tier demo, we'll use setTimeout (caution: doesn't persist across server restarts)
    setTimeout(async () => {
      try {
        const order = await Order.findById(orderId);
        if (order && order.status === OrderStatus.DELIVERED && order.escrowStatus === EscrowStatus.HELD) {
          logger.info(`[Escrow] Auto-releasing funds for order ${orderId}`);
          await this.releaseFunds(orderId, order.sellerId.toString(), order.sellerAmount, order.cutterId?.toString(), order.cutterAmount);
        }
      } catch (err) {
        logger.error(`[Escrow] Auto-release failed for order ${orderId}: ${err}`);
      }
    }, delay);
  }
}