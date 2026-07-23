const { newDb } = require('pg-mem');
const { Sequelize } = require('sequelize');
const { TransactionRepository } = require('../../src/features/inventory/transactionRepository');
const { initTransactionModel } = require('../../src/features/inventory/Transaction.model');
const { initUserModel } = require('../../src/features/user/User.model');
const { initVehicleModel } = require('../../src/features/inventory/Vehicle.model');

describe('TransactionRepository (Real DB via pg-mem)', () => {
  let db;
  let sequelize;
  let User;
  let Vehicle;
  let Transaction;
  let TransactionRepositoryInstance;
  
  let testUser;
  let testVehicle;

  beforeAll(async () => {
    db = newDb();
    
    sequelize = new Sequelize({
      dialect: 'postgres',
      dialectModule: db.adapters.createPg(),
      logging: false,
    });

    User = initUserModel(sequelize);
    Vehicle = initVehicleModel(sequelize);
    Transaction = initTransactionModel(sequelize);
    
    // Setup Associations
    User.hasMany(Transaction, { foreignKey: 'buyer_id' });
    Transaction.belongsTo(User, { foreignKey: 'buyer_id', as: 'buyer' });
    
    Vehicle.hasMany(Transaction, { foreignKey: 'vehicle_id' });
    Transaction.belongsTo(Vehicle, { foreignKey: 'vehicle_id', as: 'vehicle' });

    TransactionRepositoryInstance = new TransactionRepository(Transaction);
    
    await sequelize.sync({ force: true }); 

    testUser = await User.create({
      username: 'buyeruser',
      email: 'buyer@example.com',
      password_hash: 'hash',
      role: 'USER'
    });

    testVehicle = await Vehicle.create({
      make: 'Honda',
      model: 'Civic',
      year: 2023,
      price: 25000,
      status: 'AVAILABLE'
    });
  });

  afterAll(async () => {
    if (sequelize) {
      await sequelize.close();
    }
  });

  describe('create and find transaction', () => {
    let testTransaction;

    it('should save a valid transaction', async () => {
      const transactionData = {
        buyer_id: testUser.id,
        vehicle_id: testVehicle.id,
        sale_price: 24500,
        status: 'COMPLETED'
      };
      
      testTransaction = await TransactionRepositoryInstance.create(transactionData);

      expect(testTransaction.id).toBeDefined();
      expect(testTransaction.status).toBe('COMPLETED');
      expect(testTransaction.buyer_id).toBe(testUser.id);
      expect(testTransaction.vehicle_id).toBe(testVehicle.id);
    });

    it('should find transaction by id', async () => {
      const result = await TransactionRepositoryInstance.findById(testTransaction.id);
      expect(result).toBeDefined();
      expect(result.id).toBe(testTransaction.id);
    });

    it('should find transactions by user id', async () => {
      const results = await TransactionRepositoryInstance.findByUserId(testUser.id);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].buyer_id).toBe(testUser.id);
    });
  });
});
