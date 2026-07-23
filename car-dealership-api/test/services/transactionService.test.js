const { TransactionService } = require('../../src/features/inventory/transactionService');
const { NotFoundError, BadRequestError } = require('../../src/utils/errors');

describe('TransactionService', () => {
  let mockTransactionRepo;
  let mockVehicleRepo;
  let transactionService;

  beforeEach(() => {
    mockTransactionRepo = {
      create: jest.fn(),
      findByUserId: jest.fn(),
      findAll: jest.fn(),
    };
    mockVehicleRepo = {
      findById: jest.fn(),
    };
    transactionService = new TransactionService(mockTransactionRepo, mockVehicleRepo);
  });

  describe('processTransaction', () => {
    it('should throw NotFoundError if vehicle is not found', async () => {
      mockVehicleRepo.findById.mockResolvedValue(null);
      await expect(transactionService.processTransaction('u1', { vehicle_id: 'v1', type: 'PURCHASE', quantity: 1 })).rejects.toThrow(NotFoundError);
    });

    it('should throw BadRequestError if purchase quantity exceeds stock', async () => {
      mockVehicleRepo.findById.mockResolvedValue({ id: 'v1', quantity_in_stock: 0 });
      await expect(transactionService.processTransaction('u1', { vehicle_id: 'v1', type: 'PURCHASE', quantity: 1 })).rejects.toThrow(BadRequestError);
    });

    it('should successfully process PURCHASE', async () => {
      const mockVehicle = { id: 'v1', price: 10000, quantity_in_stock: 5, save: jest.fn() };
      mockVehicleRepo.findById.mockResolvedValue(mockVehicle);
      mockTransactionRepo.create.mockResolvedValue({ id: 't1' });

      await transactionService.processTransaction('u1', { vehicle_id: 'v1', type: 'PURCHASE', quantity: 2 });
      
      expect(mockVehicle.quantity_in_stock).toBe(3);
      expect(mockVehicle.save).toHaveBeenCalled();
      expect(mockTransactionRepo.create).toHaveBeenCalledWith({
        user_id: 'u1',
        vehicle_id: 'v1',
        type: 'PURCHASE',
        quantity: 2,
        price_at_time: 10000,
        status: 'SUCCESS'
      });
    });

    it('should successfully process RESTOCK', async () => {
      const mockVehicle = { id: 'v1', price: 10000, quantity_in_stock: 5, save: jest.fn() };
      mockVehicleRepo.findById.mockResolvedValue(mockVehicle);
      mockTransactionRepo.create.mockResolvedValue({ id: 't2' });

      await transactionService.processTransaction('u1', { vehicle_id: 'v1', type: 'RESTOCK', quantity: 10 });
      
      expect(mockVehicle.quantity_in_stock).toBe(15);
      expect(mockVehicle.save).toHaveBeenCalled();
    });
  });

  describe('getUserTransactions', () => {
    it('should return transactions for user', async () => {
      mockTransactionRepo.findByUserId.mockResolvedValue([{ id: 't1' }]);
      const result = await transactionService.getUserTransactions('u1');
      expect(result).toHaveLength(1);
    });
  });

  describe('getAllTransactions', () => {
    it('should return paginated transactions', async () => {
      mockTransactionRepo.findAll.mockResolvedValue({ rows: [{ id: 't1' }], count: 1 });
      const result = await transactionService.getAllTransactions({ page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });
  });
});
