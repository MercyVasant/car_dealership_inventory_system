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

    it('should throw BadRequestError if price is negative', async () => {
      const payload = { make: 'Ford', model: 'Focus', category: 'Compact', price: -5, quantity_in_stock: 2 };
      
      await expect(vehicleService.createVehicle(payload)).rejects.toThrow(BadRequestError);
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
});
