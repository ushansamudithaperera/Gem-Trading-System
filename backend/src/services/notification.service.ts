import { Notification, NotificationType } from '../models/Notification.model';
import { emitToUser } from '../config/socket';
import { emailService } from './email.service';
import { logger } from '../config/logger';

export class NotificationService {
  /**
   * Create in-app notification and optionally send email
   */
  static async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    metadata?: Record<string, any>,
    sendEmail: boolean = true
  ): Promise<void> {
    try {
      // Save to database
      const notification = await Notification.create({
        userId,
        type,
        title,
        message,
        metadata,
      });
      
      // Real-time via Socket.IO
      emitToUser(userId, 'new_notification', notification);
      
      // Send email for critical events
      if (sendEmail) {
        const user = await NotificationService.getUserEmail(userId);
        if (user?.email) {
          await emailService.sendEmail(user.email, title, message);
        }
      }
      
      logger.debug(`Notification sent to user ${userId}: ${title}`);
    } catch (error) {
      logger.error(`Failed to send notification: ${error}`);
    }
  }
  
  private static async getUserEmail(userId: string): Promise<{ email: string } | null> {
    const User = (await import('../models/User.model')).User;
    const user = await User.findById(userId).select('email');
    return user;
  }
  
  // Convenience methods
  static async orderCreated(userId: string, orderId: string): Promise<void> {
    await this.createNotification(userId, NotificationType.ORDER_CREATED, 'Order Created', `Your order ${orderId} has been created`, { orderId });
  }
  
  static async orderDelivered(userId: string, orderId: string): Promise<void> {
    await this.createNotification(userId, NotificationType.ORDER_DELIVERED, 'Order Delivered', `Order ${orderId} has been delivered. Auto-release in 3 days.`, { orderId });
  }
  
  static async escrowReleased(userId: string, orderId: string): Promise<void> {
    await this.createNotification(userId, NotificationType.ESCROW_RELEASED, 'Payment Released', `Funds for order ${orderId} have been released`, { orderId });
  }
}