const { newDb } = require('pg-mem');
const { Sequelize } = require('sequelize');

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
      logging: false,
    });

    // We will initialize the model here later:
    // Vehicle = initVehicleModel(sequelize);
    // VehicleRepositoryInstance = new VehicleRepository(Vehicle);
    // await sequelize.sync({ force: true }); 
  });

  afterAll(async () => {
    if (sequelize) {
      await sequelize.close();
    }
  });

  describe('create and find vehicle', () => {
    it('should save a valid vehicle', async () => {
      const vehicleData = {
        make: 'Toyota',
        model: 'Corolla',
        year: 2022,
        price: 20000.00,
        status: 'AVAILABLE',
      };
      
      const vehicle = await VehicleRepositoryInstance.create(vehicleData);

      expect(vehicle.id).toBeDefined();
      expect(vehicle.make).toBe('Toyota');
      expect(vehicle.status).toBe('AVAILABLE');
    });

    it('should find vehicle by id', async () => {
      // Mock failure because it's not implemented yet
      expect(VehicleRepositoryInstance).toBeDefined();
    });

    it('should find all available vehicles', async () => {
      // Mock failure because it's not implemented yet
      expect(VehicleRepositoryInstance).toBeDefined();
    });
  });
});
