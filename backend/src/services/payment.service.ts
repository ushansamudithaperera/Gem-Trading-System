import Stripe from 'stripe';
import { logger } from '../config/logger';
import { env } from '../config/env';

// Initialize Stripe with test key (optional, can remain mock for free tier)
let stripe: Stripe | null = null;
if (env.STRIPE_SECRET_KEY && env.STRIPE_SECRET_KEY.startsWith('sk_')) {
  stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2023-08-16' });
  logger.info('Stripe initialized in test mode');
} else {
  logger.warn('Stripe not configured, using mock payment service');
}

export class PaymentService {
  /**
   * Create a PaymentIntent for escrow
   */
  static async createEscrowPaymentIntent(amount: number, currency: string = 'usd', metadata?: Record<string, any>): Promise<string> {
    if (stripe) {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // cents
        currency,
        capture_method: 'manual', // Hold funds
        metadata,
      });
      logger.info(`Stripe PaymentIntent created: ${paymentIntent.id}`);
      return paymentIntent.id;
    } else {
      // Mock
      const mockId = `mock_pi_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
      logger.info(`Mock PaymentIntent created: ${mockId}`);
      return mockId;
    }
  }
  
  /**
   * Capture (release) a held PaymentIntent
   */
  static async capturePaymentIntent(paymentIntentId: string, amount?: number): Promise<boolean> {
    if (stripe) {
      await stripe.paymentIntents.capture(paymentIntentId, amount ? { amount_to_capture: Math.round(amount * 100) } : {});
      return true;
    } else {
      logger.info(`Mock capture for ${paymentIntentId}`);
      return true;
    }
  }
  
  /**
   * Refund a PaymentIntent
   */
  static async refundPaymentIntent(paymentIntentId: string, amount?: number): Promise<boolean> {
    if (stripe) {
      await stripe.refunds.create({ payment_intent: paymentIntentId, amount: amount ? Math.round(amount * 100) : undefined });
      return true;
    } else {
      logger.info(`Mock refund for ${paymentIntentId}`);
      return true;
    }
  }
}