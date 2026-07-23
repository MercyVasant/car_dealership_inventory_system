const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');
require('dotenv').config();

const { initUserModel } = require('../src/features/user/User.model');
const { initVehicleModel } = require('../src/features/inventory/Vehicle.model');
const { initTransactionModel } = require('../src/features/inventory/Transaction.model');
const { initRefreshTokenModel } = require('../src/features/auth/RefreshToken.model');

const seedDatabase = async () => {
  console.log('Connecting to database...');
  const sequelize = new Sequelize(
    process.env.DB_NAME || 'cardealership',
    process.env.DB_USER || 'myuser',
    process.env.DB_PASSWORD || 'mypassword',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false,
    }
  );

  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');

    // Initialize Models
    console.log('Initializing models...');
    const User = initUserModel(sequelize);
    const Vehicle = initVehicleModel(sequelize);
    const Transaction = initTransactionModel(sequelize);
    const RefreshToken = initRefreshTokenModel(sequelize);

    // Setup Associations
    User.hasMany(Transaction, { foreignKey: 'buyer_id' });
    Transaction.belongsTo(User, { foreignKey: 'buyer_id', as: 'buyer' });
    
    Vehicle.hasMany(Transaction, { foreignKey: 'vehicle_id' });
    Transaction.belongsTo(Vehicle, { foreignKey: 'vehicle_id', as: 'vehicle' });
    
    User.hasMany(RefreshToken, { foreignKey: 'user_id' });
    RefreshToken.belongsTo(User, { foreignKey: 'user_id' });

    console.log('Checking existing data...');
    const userCount = await User.count();
    if (userCount > 0) {
      console.log('Database is already seeded. Exiting.');
      process.exit(0);
    }

    console.log('Seeding Users...');
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const userPasswordHash = await bcrypt.hash('user123', 10);

    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@dealership.com',
      password_hash: adminPasswordHash,
      role: 'ADMIN',
    });

    const standardUser = await User.create({
      username: 'johndoe',
      email: 'john@example.com',
      password_hash: userPasswordHash,
      role: 'USER',
    });

    console.log('Seeding Vehicles...');
    const vehicles = await Vehicle.bulkCreate([
      { make: 'Toyota', model: 'Camry', year: 2022, price: 24000, status: 'AVAILABLE' },
      { make: 'Honda', model: 'Civic', year: 2023, price: 26000, status: 'AVAILABLE' },
      { make: 'Ford', model: 'Mustang', year: 2021, price: 35000, status: 'SOLD' },
      { make: 'Chevrolet', model: 'Tahoe', year: 2023, price: 55000, status: 'AVAILABLE' },
      { make: 'Tesla', model: 'Model 3', year: 2024, price: 40000, status: 'SOLD' },
    ]);

    console.log('Seeding Transactions...');
    const soldMustang = vehicles.find(v => v.model === 'Mustang');
    const soldTesla = vehicles.find(v => v.model === 'Model 3');

    await Transaction.bulkCreate([
      {
        buyer_id: standardUser.id,
        vehicle_id: soldMustang.id,
        sale_price: 34500,
        status: 'COMPLETED'
      },
      {
        buyer_id: standardUser.id,
        vehicle_id: soldTesla.id,
        sale_price: 40000,
        status: 'COMPLETED'
      }
    ]);

    console.log('Seeding completed successfully!');
  } catch (error) {
    console.error('Failed to seed database:', error);
  } finally {
    await sequelize.close();
  }
};

seedDatabase();
