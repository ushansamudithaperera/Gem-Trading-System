import { logger } from '../config/logger';
import { env } from '../config/env';

// Mock courier service - in production use real courier API (e.g., PickMe, Uber Direct, etc.)
export class CourierService {
  /**
   * Create a shipment
   */
  static async createShipment(orderId: string, _pickupAddress: unknown, _dropoffAddress: unknown): Promise<{ trackingNumber: string; courierCompany: string }> {
    logger.info(`[Courier] Creating shipment for order ${orderId}`);
    
    // Mock tracking number
    const trackingNumber = `MOCK-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const courierCompany = 'MockCourier';
    
    // Simulate async processing
    setTimeout(async () => {
      await CourierService.mockDelivery(orderId, trackingNumber);
    }, env.COURIER_MOCK_DELAY_MS);
    
    return { trackingNumber, courierCompany };
  }
  
  private static async mockDelivery(orderId: string, trackingNumber: string): Promise<void> {
    logger.info(`[Courier] Mock delivery for order ${orderId}, tracking ${trackingNumber}`);
    
    // Trigger webhook to mark as delivered
    const webhookUrl = `${env.BACKEND_URL}/api/v1/webhook/courier/delivered`;
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber: orderId, trackingNumber, deliveredAt: new Date().toISOString() }),
      });
    } catch (err) {
      logger.error(`[Courier] Failed to trigger delivery webhook: ${err}`);
    }
  }
  
  /**
   * Track shipment
   */
  static async trackShipment(trackingNumber: string): Promise<unknown> {
    // Mock tracking data
    return {
      trackingNumber,
      status: 'IN_TRANSIT',
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      history: [
        { location: 'Colombo', status: 'Picked Up', timestamp: new Date() },
      ],
    };
  }
}