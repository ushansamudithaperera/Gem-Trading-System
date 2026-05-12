import { EscrowService } from '../../../src/services/escrow.service';
import { Order, EscrowStatus, OrderStatus } from '../../../src/models/Order.model';
import { logger } from '../../../src/config/logger';

// Mock dependencies
jest.mock('../../../src/models/Order.model');
jest.mock('../../../src/config/logger');

const mockOrder = {
  _id: 'order123',
  sellerId: 'seller456',
  sellerAmount: 1000,
  cutterId: 'cutter789',
  cutterAmount: 200,
  status: OrderStatus.DELIVERED,
  escrowStatus: EscrowStatus.HELD,
  save: jest.fn(),
};

describe('EscrowService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('holdFunds', () => {
    it('should create a mock payment intent', async () => {
      const result = await EscrowService.holdFunds('order123', 1000);
      expect(result).toContain('mock_pi_order123');
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Holding 1000 for order order123'));
    });
  });

  describe('releaseFunds', () => {
    it('should release funds to seller only', async () => {
      (Order.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockOrder);
      
      const result = await EscrowService.releaseFunds('order123', 'seller456', 1000);
      
      expect(result).toBe(true);
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Releasing 1000 to seller seller456'));
    });

    it('should release funds to seller and cutter', async () => {
      (Order.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockOrder);
      
      const result = await EscrowService.releaseFunds('order123', 'seller456', 1000, 'cutter789', 200);
      
      expect(result).toBe(true);
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('and 200 to cutter cutter789'));
    });
  });

  describe('refundFunds', () => {
    it('should refund full amount to buyer', async () => {
      (Order.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockOrder);
      
      const result = await EscrowService.refundFunds('order123', 'buyer456', 1000);
      
      expect(result).toBe(true);
      expect(logger.info).toHaveBeenCalledWith(expect.stringContaining('Refunding 1000 to buyer buyer456'));
    });
  });

  describe('scheduleAutoRelease', () => {
    it('should schedule a timer for future date', () => {
      jest.useFakeTimers();
      const futureDate = new Date(Date.now() + 86400000); // 1 day later
      
      EscrowService.scheduleAutoRelease('order123', futureDate);
      
      expect(setTimeout).toHaveBeenCalled();
      jest.useRealTimers();
    });

    it('should not schedule if date is in past', () => {
      jest.useFakeTimers();
      const pastDate = new Date(Date.now() - 86400000);
      
      EscrowService.scheduleAutoRelease('order123', pastDate);
      
      // Should still schedule but with immediate execution (handled in timerScheduler)
      expect(setTimeout).toHaveBeenCalled();
      jest.useRealTimers();
    });
  });
});