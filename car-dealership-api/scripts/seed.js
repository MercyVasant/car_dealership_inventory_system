const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');
require('dotenv').config();

const { User } = require('../src/features/user/User.model');
const { Vehicle } = require('../src/features/inventory/Vehicle.model');
const { Transaction } = require('../src/features/inventory/Transaction.model');

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
    console.log('Database connection established.');

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
      { make: 'Toyota', model: 'Camry', category: 'Sedan', price: 24000, quantity_in_stock: 5 },
      { make: 'Honda', model: 'Civic', category: 'Compact', price: 26000, quantity_in_stock: 3 },
      { make: 'Ford', model: 'Mustang', category: 'Sports', price: 35000, quantity_in_stock: 0 },
      { make: 'Chevrolet', model: 'Tahoe', category: 'SUV', price: 55000, quantity_in_stock: 2 },
      { make: 'Tesla', model: 'Model 3', category: 'Electric', price: 40000, quantity_in_stock: 0 },
    ]);

    console.log('Seeding Transactions...');
    const soldMustang = vehicles.find(v => v.model === 'Mustang');
    const soldTesla = vehicles.find(v => v.model === 'Model 3');

    await Transaction.bulkCreate([
      {
        user_id: standardUser.id,
        vehicle_id: soldMustang.id,
        type: 'PURCHASE',
        quantity: 1,
        price_at_time: 35000,
        status: 'SUCCESS'
      },
      {
        user_id: standardUser.id,
        vehicle_id: soldTesla.id,
        type: 'PURCHASE',
        quantity: 1,
        price_at_time: 40000,
        status: 'SUCCESS'
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
