const { VehicleService } = require('../../src/features/inventory/vehicleService');
const { BadRequestError, NotFoundError } = require('../../src/utils/errors');

describe('VehicleService', () => {
  let mockVehicleRepository;
  let vehicleService;

  beforeEach(() => {
    mockVehicleRepository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
    };
    vehicleService = new VehicleService(mockVehicleRepository);
  });

  describe('createVehicle', () => {
    it('should create a vehicle', async () => {
      const payload = { make: 'Ford', model: 'Focus', category: 'Compact', price: 15000, quantity_in_stock: 2 };
      mockVehicleRepository.create.mockResolvedValue({ id: 'uuid-123', ...payload });

      const result = await vehicleService.createVehicle(payload);
      expect(result.make).toBe('Ford');
      expect(mockVehicleRepository.create).toHaveBeenCalledWith(payload);
    });
  });

  describe('getVehicles', () => {
    it('should return paginated vehicles where is_deleted = false', async () => {
      mockVehicleRepository.findAll.mockResolvedValue({
        rows: [{ make: 'Ford' }],
        count: 1
      });

      const result = await vehicleService.getVehicles({ page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(mockVehicleRepository.findAll).toHaveBeenCalledWith({
        where: { is_deleted: false },
        offset: 0,
        limit: 10,
        order: [['created_at', 'DESC']]
      });
    });
  });
  describe('updateVehicle', () => {
    it('should update and return the vehicle', async () => {
      const payload = { make: 'Honda', price: 20000 };
      const existingVehicle = { id: 'uuid-1', update: jest.fn().mockResolvedValue(true) };
      mockVehicleRepository.findById.mockResolvedValue(existingVehicle);

      const result = await vehicleService.updateVehicle('uuid-1', payload);
      expect(mockVehicleRepository.findById).toHaveBeenCalledWith('uuid-1');
      expect(existingVehicle.update).toHaveBeenCalledWith(payload);
    });
  });

  describe('deleteVehicle', () => {
    it('should soft delete the vehicle', async () => {
      const existingVehicle = { id: 'uuid-1', update: jest.fn().mockResolvedValue(true) };
      mockVehicleRepository.findById.mockResolvedValue(existingVehicle);

      await vehicleService.deleteVehicle('uuid-1');
      expect(existingVehicle.update).toHaveBeenCalledWith({ is_deleted: true });
    });
  });

  describe('searchVehicles', () => {
    it('should build correct where clause for filters', async () => {
      mockVehicleRepository.findAll.mockResolvedValue({ rows: [], count: 0 });

      await vehicleService.searchVehicles({
        make: 'Honda',
        minPrice: 10000,
        maxPrice: 20000,
        page: 1,
        limit: 10
      });

      expect(mockVehicleRepository.findAll).toHaveBeenCalled();
      const callArgs = mockVehicleRepository.findAll.mock.calls[0][0];
      
      expect(callArgs.where.make).toBeDefined();
      expect(callArgs.where.is_deleted).toBe(false);
      expect(callArgs.where.price).toBeDefined();
    });

    it('should throw BadRequestError if minPrice > maxPrice', async () => {
      const { BadRequestError } = require('../../src/utils/errors');
      await expect(vehicleService.searchVehicles({ minPrice: 20000, maxPrice: 10000 }))
        .rejects.toThrow(BadRequestError);
    });
  });
});
