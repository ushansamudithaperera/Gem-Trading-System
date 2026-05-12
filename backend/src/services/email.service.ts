import nodemailer from 'nodemailer';
import { logger } from '../config/logger';
import { env } from '../config/env';

// Email service using Nodemailer (free SMTP like Gmail)
class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  
  constructor() {
    if (env.EMAIL_USER && env.EMAIL_PASS) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: env.EMAIL_USER, pass: env.EMAIL_PASS },
      });
      logger.info('Email service initialized');
    } else {
      logger.warn('Email credentials missing, email sending disabled in production');
    }
  }
  
  async sendEmail(to: string, subject: string, html: string): Promise<boolean> {
    if (!this.transporter) {
      logger.warn(`Email not sent (no transporter): ${subject} to ${to}`);
      return false;
    }
    
    try {
      await this.transporter.sendMail({
        from: `"Gem Trading Platform" <${env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });
      logger.info(`Email sent to ${to}: ${subject}`);
      return true;
    } catch (error) {
      logger.error(`Email failed to ${to}: ${error}`);
      return false;
    }
  }
  
  // Template methods
  async sendOrderConfirmation(to: string, orderNumber: string, amount: number): Promise<void> {
    const html = `
      <h1>Order Confirmation</h1>
      <p>Your order ${orderNumber} has been created.</p>
      <p>Amount held in escrow: $${amount}</p>
      <a href="${env.FRONTEND_URL}/orders/${orderNumber}">View Order</a>
    `;
    await this.sendEmail(to, `Order Confirmation - ${orderNumber}`, html);
  }
  
  async sendDeliveryNotification(to: string, orderNumber: string): Promise<void> {
    const html = `
      <h1>Order Delivered</h1>
      <p>Your order ${orderNumber} has been delivered.</p>
      <p>The auto-release timer will release funds in 3 days if you don't raise a dispute.</p>
    `;
    await this.sendEmail(to, `Order Delivered - ${orderNumber}`, html);
  }
  
  async sendDisputeOpened(to: string, orderNumber: string): Promise<void> {
    const html = `<h1>Dispute Opened</h1><p>Dispute for order ${orderNumber} is under review.</p>`;
    await this.sendEmail(to, `Dispute Opened - ${orderNumber}`, html);
  }
}

export const emailService = new EmailService();