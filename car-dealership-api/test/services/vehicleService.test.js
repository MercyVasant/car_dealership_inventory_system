const { VehicleService } = require('../../src/features/inventory/vehicleService');

describe('VehicleService', () => {
  let mockVehicleRepo;
  let vehicleService;

  beforeEach(() => {
    mockVehicleRepo = {
      findAllAvailable: jest.fn(),
      findById: jest.fn(),
      create: jest.fn()
    };
    vehicleService = new VehicleService(mockVehicleRepo);
  });

  describe('getAllAvailable', () => {
    it('should return a list of available vehicles', async () => {
      mockVehicleRepo.findAllAvailable.mockResolvedValue([{ id: 'v1', make: 'Toyota' }]);
      const result = await vehicleService.getAllAvailable();
      expect(result).toHaveLength(1);
      expect(mockVehicleRepo.findAllAvailable).toHaveBeenCalledTimes(1);
    });
  });

  describe('getVehicleById', () => {
    it('should return a vehicle if found', async () => {
      mockVehicleRepo.findById.mockResolvedValue({ id: 'v2', make: 'Honda' });
      const result = await vehicleService.getVehicleById('v2');
      expect(result.make).toBe('Honda');
    });

    it('should throw an error if vehicle not found', async () => {
      mockVehicleRepo.findById.mockResolvedValue(null);
      await expect(vehicleService.getVehicleById('v3')).rejects.toThrow('Vehicle not found');
    });
  });

  describe('addVehicle', () => {
    it('should successfully add a valid vehicle', async () => {
      const newVehicle = { make: 'Ford', model: 'Focus', year: 2022, price: 15000 };
      mockVehicleRepo.create.mockResolvedValue({ id: 'v4', ...newVehicle });
      const result = await vehicleService.addVehicle(newVehicle);
      expect(result.id).toBe('v4');
      expect(mockVehicleRepo.create).toHaveBeenCalledWith(newVehicle);
    });
  });
});
