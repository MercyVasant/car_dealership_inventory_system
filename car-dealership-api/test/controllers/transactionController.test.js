const request = require('supertest');
const express = require('express');
const { TransactionController } = require('../../src/features/inventory/transactionController');
const { catchAsync } = require('../../src/utils/catchAsync');
const { errorHandler } = require('../../src/middleware/errorHandler');

jest.mock('../../src/middleware/auth', () => ({
  authMiddleware: (req, res, next) => {
    req.user = { id: 'mock-user-id', role: req.headers['x-role'] || 'USER' };
    next();
  },
  authorize: (role) => (req, res, next) => {
    if (req.user.role !== role) {
      return res.status(403).json({ error: 'Forbidden', status: 403, type: 'ForbiddenError' });
    }
    next();
  }
}));

describe('TransactionController', () => {
  let mockTransactionService;
  let app;

  beforeEach(() => {
    mockTransactionService = {
      processTransaction: jest.fn(),
      getUserTransactions: jest.fn(),
      getAllTransactions: jest.fn(),
    };

    const transactionController = new TransactionController(mockTransactionService);
    app = express();
    app.use(express.json());

    const { authMiddleware, authorize } = require('../../src/middleware/auth');

    app.post('/api/transactions', authMiddleware, catchAsync((req, res) => transactionController.createTransaction(req, res)));
    app.get('/api/transactions/me', authMiddleware, catchAsync((req, res) => transactionController.getMyTransactions(req, res)));
    app.get('/api/transactions', authMiddleware, authorize('ADMIN'), catchAsync((req, res) => transactionController.getAllTransactions(req, res)));
    
    app.post('/api/vehicles/:id/purchase', authMiddleware, catchAsync((req, res) => transactionController.purchase(req, res)));
    app.post('/api/vehicles/:id/restock', authMiddleware, authorize('ADMIN'), catchAsync((req, res) => transactionController.restock(req, res)));

    app.use(errorHandler);
  });

  describe('POST /api/transactions', () => {
    it('should allow user to PURCHASE', async () => {
      mockTransactionService.processTransaction.mockResolvedValue({ id: 't1' });
      const res = await request(app).post('/api/transactions')
        .set('x-role', 'USER')
        .send({ vehicle_id: '00000000-0000-0000-0000-000000000001', type: 'PURCHASE', quantity: 1 });
      
      expect(res.statusCode).toBe(201);
      expect(mockTransactionService.processTransaction).toHaveBeenCalled();
    });

    it('should return 403 if USER attempts to RESTOCK', async () => {
      const res = await request(app).post('/api/transactions')
        .set('x-role', 'USER')
        .send({ vehicle_id: '00000000-0000-0000-0000-000000000001', type: 'RESTOCK', quantity: 1 });
      
      expect(res.statusCode).toBe(403);
    });

    it('should allow ADMIN to RESTOCK', async () => {
      mockTransactionService.processTransaction.mockResolvedValue({ id: 't1' });
      const res = await request(app).post('/api/transactions')
        .set('x-role', 'ADMIN')
        .send({ vehicle_id: '00000000-0000-0000-0000-000000000001', type: 'RESTOCK', quantity: 10 });
      
      expect(res.statusCode).toBe(201);
    });
  });

  describe('POST /api/vehicles/:id/purchase', () => {
    it('should call processTransaction with type PURCHASE', async () => {
      mockTransactionService.processTransaction.mockResolvedValue({ id: 't2' });
      const res = await request(app).post('/api/vehicles/v1/purchase')
        .set('x-role', 'USER')
        .send({ quantity: 2 });
      
      expect(res.statusCode).toBe(201);
      expect(mockTransactionService.processTransaction).toHaveBeenCalledWith(
        'mock-user-id', 
        { vehicle_id: 'v1', type: 'PURCHASE', quantity: 2 }
      );
    });
    
    it('should default quantity to 1 if not provided', async () => {
      mockTransactionService.processTransaction.mockResolvedValue({ id: 't3' });
      const res = await request(app).post('/api/vehicles/v1/purchase')
        .set('x-role', 'USER');
      
      expect(res.statusCode).toBe(201);
      expect(mockTransactionService.processTransaction).toHaveBeenCalledWith(
        'mock-user-id', 
        { vehicle_id: 'v1', type: 'PURCHASE', quantity: 1 }
      );
    });
  });

  describe('POST /api/vehicles/:id/restock', () => {
    it('should call processTransaction with type RESTOCK for ADMIN', async () => {
      mockTransactionService.processTransaction.mockResolvedValue({ id: 't4' });
      const res = await request(app).post('/api/vehicles/v1/restock')
        .set('x-role', 'ADMIN')
        .send({ quantity: 5 });
      
      expect(res.statusCode).toBe(201);
      expect(mockTransactionService.processTransaction).toHaveBeenCalledWith(
        'mock-user-id', 
        { vehicle_id: 'v1', type: 'RESTOCK', quantity: 5 }
      );
    });

    it('should return 403 for non-admin', async () => {
      const res = await request(app).post('/api/vehicles/v1/restock')
        .set('x-role', 'USER')
        .send({ quantity: 5 });
      
      expect(res.statusCode).toBe(403);
    });
  });

  describe('GET /api/transactions/me', () => {
    it('should return user transactions', async () => {
      mockTransactionService.getUserTransactions.mockResolvedValue([{ id: 't1' }]);
      const res = await request(app).get('/api/transactions/me').set('x-role', 'USER');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveLength(1);
    });
  });

  describe('GET /api/transactions', () => {
    it('should return 403 for non-admin', async () => {
      const res = await request(app).get('/api/transactions').set('x-role', 'USER');
      expect(res.statusCode).toBe(403);
    });

    it('should return all transactions for admin', async () => {
      mockTransactionService.getAllTransactions.mockResolvedValue({ data: [{ id: 't1' }], total: 1 });
      const res = await request(app).get('/api/transactions').set('x-role', 'ADMIN');
      expect(res.statusCode).toBe(200);
      expect(res.body.total).toBe(1);
    });
  });
});
