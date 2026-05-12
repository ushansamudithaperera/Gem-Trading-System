import { scheduleAutoRelease, cancelAutoRelease } from '../../../src/utils/timerScheduler';
import { Order, OrderStatus, EscrowStatus } from '../../../src/models/Order.model';
import { escrowService } from '../../../src/services/escrow.service';
import { logger } from '../../../src/config/logger';

// Mock dependencies
jest.mock('../../../src/models/Order.model');
jest.mock('../../../src/services/escrow.service');
jest.mock('../../../src/config/logger');

const mockOrder = {
  _id: 'order123',
  status: OrderStatus.DELIVERED,
  escrowStatus: EscrowStatus.HELD,
  sellerId: 'seller456',
  sellerAmount: 1000,
  save: jest.fn(),
};

describe('TimerScheduler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('scheduleAutoRelease', () => {
    it('should schedule a timer with correct delay', () => {
      const futureDate = new Date(Date.now() + 5000);
      
      scheduleAutoRelease('order123', futureDate);
      
      expect(setTimeout).toHaveBeenCalledTimes(1);
      const call = (setTimeout as jest.Mock).mock.calls[0];
      expect(call[1]).toBe(5000);
    });

    it('should execute auto-release when timer fires', async () => {
      (Order.findById as jest.Mock).mockResolvedValue(mockOrder);
      (escrowService.releaseFunds as jest.Mock).mockResolvedValue(true);
      
      const futureDate = new Date(Date.now() + 1000);
      scheduleAutoRelease('order123', futureDate);
      
      // Fast-forward time
      jest.advanceTimersByTime(1000);
      
      // Allow promises to resolve
      await Promise.resolve();
      
      expect(Order.findById).toHaveBeenCalledWith('order123');
      expect(escrowService.releaseFunds).toHaveBeenCalledWith(
        'order123',
        'seller456',
        1000,
        undefined,
        undefined
      );
      expect(mockOrder.save).toHaveBeenCalled();
    });

    it('should NOT release if order status is not DELIVERED', async () => {
      const notDeliveredOrder = { ...mockOrder, status: OrderStatus.SHIPPED };
      (Order.findById as jest.Mock).mockResolvedValue(notDeliveredOrder);
      
      const futureDate = new Date(Date.now() + 1000);
      scheduleAutoRelease('order123', futureDate);
      
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
      
      expect(escrowService.releaseFunds).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('skipped'));
    });

    it('should NOT release if escrow is not HELD', async () => {
      const refundedOrder = { ...mockOrder, escrowStatus: EscrowStatus.REFUNDED };
      (Order.findById as jest.Mock).mockResolvedValue(refundedOrder);
      
      const futureDate = new Date(Date.now() + 1000);
      scheduleAutoRelease('order123', futureDate);
      
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
      
      expect(escrowService.releaseFunds).not.toHaveBeenCalled();
    });

    it('should clear existing timer if rescheduled', () => {
      const date1 = new Date(Date.now() + 10000);
      const date2 = new Date(Date.now() + 20000);
      
      scheduleAutoRelease('order123', date1);
      scheduleAutoRelease('order123', date2);
      
      // First timer should be cleared, second remains
      expect(clearTimeout).toHaveBeenCalledTimes(1);
      expect(setTimeout).toHaveBeenCalledTimes(2);
    });
  });

  describe('cancelAutoRelease', () => {
    it('should cancel an existing timer', () => {
      const futureDate = new Date(Date.now() + 10000);
      scheduleAutoRelease('order123', futureDate);
      
      cancelAutoRelease('order123');
      
      expect(clearTimeout).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Cancelled auto-release for order123'));
    });

    it('should do nothing if no timer exists', () => {
      cancelAutoRelease('nonexistent');
      
      expect(clearTimeout).not.toHaveBeenCalled();
    });
  });
});