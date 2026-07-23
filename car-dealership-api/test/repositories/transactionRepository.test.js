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
    User.hasMany(Transaction, { foreignKey: 'user_id' });
    Transaction.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
    
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
      category: 'Sedan',
      price: 25000,
      quantity_in_stock: 5
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
        user_id: testUser.id,
        vehicle_id: testVehicle.id,
        type: 'PURCHASE',
        quantity: 1,
        price_at_time: 25000,
        status: 'SUCCESS'
      };
      
      testTransaction = await TransactionRepositoryInstance.create(transactionData);

      expect(testTransaction.id).toBeDefined();
      expect(testTransaction.status).toBe('SUCCESS');
      expect(testTransaction.user_id).toBe(testUser.id);
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
      expect(results[0].user_id).toBe(testUser.id);
    });
  });
});
