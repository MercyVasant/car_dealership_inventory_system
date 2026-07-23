const { newDb } = require('pg-mem');
const { Sequelize } = require('sequelize');
const { VehicleRepository } = require('../../src/features/inventory/vehicleRepository');
const { initVehicleModel } = require('../../src/features/inventory/Vehicle.model');

describe('VehicleRepository (Real DB via pg-mem)', () => {
  let db;
  let sequelize;
  let Vehicle;
  let VehicleRepositoryInstance;

  beforeAll(async () => {
    db = newDb();
    
    sequelize = new Sequelize({
      dialect: 'postgres',
      dialectModule: db.adapters.createPg(),
      logging: console.log,
    });

    Vehicle = initVehicleModel(sequelize);
    VehicleRepositoryInstance = new VehicleRepository(Vehicle);
    
    await sequelize.sync({ force: true }); 
  });

  afterAll(async () => {
    if (sequelize) {
      await sequelize.close();
    }
  });

  describe('create and find vehicle', () => {
    let testVehicle;

    it('should save a valid vehicle', async () => {
      const vehicleData = {
        make: 'Toyota',
        model: 'Corolla',
        year: 2022,
        price: 20000.00,
        status: 'AVAILABLE',
      };
      
      testVehicle = await VehicleRepositoryInstance.create(vehicleData);

      expect(testVehicle.id).toBeDefined();
      expect(testVehicle.make).toBe('Toyota');
      expect(testVehicle.status).toBe('AVAILABLE');
    });

    it('should find vehicle by id', async () => {
      const result = await VehicleRepositoryInstance.findById(testVehicle.id);
      expect(result).toBeDefined();
      expect(result.make).toBe('Toyota');
    });

    it('should find all available vehicles', async () => {
      const results = await VehicleRepositoryInstance.findAll({ where: { is_deleted: false } });
      expect(results.rows.length).toBeGreaterThan(0);
      expect(results.rows[0].status).toBe('AVAILABLE');
    });
  });
});
