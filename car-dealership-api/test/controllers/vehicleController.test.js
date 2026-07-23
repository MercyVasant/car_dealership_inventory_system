const request = require('supertest');
const express = require('express');
const { VehicleController } = require('../../src/features/inventory/vehicleController');
const { catchAsync } = require('../../src/utils/catchAsync');
const { errorHandler } = require('../../src/middleware/errorHandler');

// Mock auth middleware to easily simulate USER or ADMIN
jest.mock('../../src/middleware/auth', () => ({
  authenticate: (req, res, next) => {
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

describe('VehicleController (Integration)', () => {
  let mockVehicleService;
  let app;

  beforeEach(() => {
    mockVehicleService = {
      createVehicle: jest.fn(),
      getVehicles: jest.fn(),
    };

    const vehicleController = new VehicleController(mockVehicleService);
    app = express();
    app.use(express.json());

    const { authenticate, authorize } = require('../../src/middleware/auth');

    // Mocks for POST and GET
    app.post('/api/vehicles', authenticate, authorize('ADMIN'), catchAsync((req, res) => vehicleController.createVehicle(req, res)));
    app.get('/api/vehicles', authenticate, catchAsync((req, res) => vehicleController.getVehicles(req, res)));
    app.put('/api/vehicles/:id', authenticate, authorize('ADMIN'), catchAsync((req, res) => vehicleController.updateVehicle(req, res)));
    app.delete('/api/vehicles/:id', authenticate, authorize('ADMIN'), catchAsync((req, res) => vehicleController.deleteVehicle(req, res)));

    app.use(errorHandler);
  });

  describe('POST /api/vehicles', () => {
    const validPayload = {
      make: 'Toyota',
      model: 'Corolla',
      category: 'Sedan',
      price: 20000,
      quantity_in_stock: 5,
    };

    it('should return 201 when admin creates a vehicle', async () => {
      mockVehicleService.createVehicle.mockResolvedValue({ id: 'uuid', ...validPayload });

      const res = await request(app)
        .post('/api/vehicles')
        .set('x-role', 'ADMIN')
        .send(validPayload);

      expect(res.statusCode).toBe(201);
      expect(res.body.make).toBe('Toyota');
      expect(mockVehicleService.createVehicle).toHaveBeenCalledWith(validPayload);
    });

    it('should return 403 when non-admin attempts to create a vehicle', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('x-role', 'USER')
        .send(validPayload);

      expect(res.statusCode).toBe(403);
    });

    it('should return 400 for invalid payload (e.g., negative price)', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('x-role', 'ADMIN')
        .send({ ...validPayload, price: -100 });

      // We expect the controller to throw BadRequestError which results in 400
      expect(res.statusCode).toBe(400);
    });
  });

  describe('GET /api/vehicles', () => {
    it('should return paginated list of vehicles (200)', async () => {
      mockVehicleService.getVehicles.mockResolvedValue({
        data: [{ make: 'Honda', model: 'Civic' }],
        total: 1,
        page: 1,
        limit: 20
      });

      const res = await request(app)
        .get('/api/vehicles?page=1&limit=20')
        .set('x-role', 'USER');

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(mockVehicleService.getVehicles).toHaveBeenCalledWith({ page: 1, limit: 20 });
    });
  });

  describe('PUT /api/vehicles/:id', () => {
    const updatePayload = {
      make: 'Honda',
      model: 'Accord',
      category: 'Sedan',
      price: 22000,
      quantity_in_stock: 3
    };

    it('should update and return 200 for admin', async () => {
      mockVehicleService.updateVehicle.mockResolvedValue({ id: 'uuid-1', ...updatePayload });

      const res = await request(app)
        .put('/api/vehicles/uuid-1')
        .set('x-role', 'ADMIN')
        .send(updatePayload);

      expect(res.statusCode).toBe(200);
      expect(res.body.model).toBe('Accord');
    });

    it('should return 400 for invalid payload', async () => {
      const res = await request(app)
        .put('/api/vehicles/uuid-1')
        .set('x-role', 'ADMIN')
        .send({ price: -100 });
        
      expect(res.statusCode).toBe(400);
    });
  });

  describe('DELETE /api/vehicles/:id', () => {
    it('should return 204 when admin deletes a vehicle', async () => {
      mockVehicleService.deleteVehicle.mockResolvedValue();

      const res = await request(app)
        .delete('/api/vehicles/uuid-1')
        .set('x-role', 'ADMIN');

      expect(res.statusCode).toBe(204);
      expect(mockVehicleService.deleteVehicle).toHaveBeenCalledWith('uuid-1');
    });

    it('should return 403 when non-admin attempts to delete', async () => {
      const res = await request(app)
        .delete('/api/vehicles/uuid-1')
        .set('x-role', 'USER');

      expect(res.statusCode).toBe(403);
    });
  });
});
