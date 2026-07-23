const { TransactionService } = require('../../src/features/inventory/transactionService');

describe('TransactionService', () => {
  let mockTransactionRepo;
  let mockVehicleRepo;
  let transactionService;

  beforeEach(() => {
    mockTransactionRepo = {
      create: jest.fn(),
      findByUserId: jest.fn()
    };
    mockVehicleRepo = {
      findById: jest.fn(),
    };
    transactionService = new TransactionService(mockTransactionRepo, mockVehicleRepo);
  });

  describe('purchaseVehicle', () => {
    it('should throw an error if vehicle is not found', async () => {
      mockVehicleRepo.findById.mockResolvedValue(null);
      await expect(transactionService.purchaseVehicle('u1', 'v1')).rejects.toThrow('Vehicle not found');
    });

    it('should throw an error if vehicle is not available', async () => {
      mockVehicleRepo.findById.mockResolvedValue({ id: 'v1', status: 'SOLD' });
      await expect(transactionService.purchaseVehicle('u1', 'v1')).rejects.toThrow('Vehicle is not available for purchase');
    });

    it('should successfully create a transaction and mark vehicle as SOLD', async () => {
      const mockVehicle = { 
        id: 'v1', 
        price: 25000, 
        status: 'AVAILABLE',
        save: jest.fn().mockResolvedValue(true)
      };
      
      mockVehicleRepo.findById.mockResolvedValue(mockVehicle);
      mockTransactionRepo.create.mockResolvedValue({ id: 't1', status: 'COMPLETED' });

      const result = await transactionService.purchaseVehicle('u1', 'v1');

      expect(result.id).toBe('t1');
      expect(mockVehicle.status).toBe('SOLD');
      expect(mockVehicle.save).toHaveBeenCalled();
      expect(mockTransactionRepo.create).toHaveBeenCalledWith({
        buyer_id: 'u1',
        vehicle_id: 'v1',
        sale_price: 25000,
        status: 'COMPLETED'
      });
    });
  });

  describe('getUserTransactions', () => {
    it('should return transactions for a given user', async () => {
      mockTransactionRepo.findByUserId.mockResolvedValue([{ id: 't1' }, { id: 't2' }]);
      const result = await transactionService.getUserTransactions('u1');
      expect(result).toHaveLength(2);
      expect(mockTransactionRepo.findByUserId).toHaveBeenCalledWith('u1');
    });
  });
});
