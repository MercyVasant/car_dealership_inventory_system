const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');
require('dotenv').config();

const { sequelize, User, Vehicle, Transaction } = require('../src/db');

const seedDatabase = async () => {
  console.log('Connecting to database...');

  try {
    await sequelize.authenticate();
    console.log('Database connection established.');

    console.log('Dropping and re-syncing database...');
    await sequelize.sync({ force: true });

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
      { make: 'Porsche', model: '911 GT3 RS', category: 'SUPERCAR', price: 240000, quantity_in_stock: 1 },
      { make: 'Aston Martin', model: 'DB12', category: 'GRAND TOURER', price: 245000, quantity_in_stock: 2 },
      { make: 'Honda', model: 'Accord', category: 'EXECUTIVE SALOON', price: 35000, quantity_in_stock: 5 },
      { make: 'Toyota', model: 'Camry', category: 'EXECUTIVE SALOON', price: 30000, quantity_in_stock: 4 },
      { make: 'Tesla', model: 'Model S', category: 'ELECTRIC ASSET', price: 90000, quantity_in_stock: 3 },
      { make: 'Lamborghini', model: 'Urus', category: 'SPORT UTILITY', price: 230000, quantity_in_stock: 0 },
    ]);

    console.log('Seeding Transactions...');
    const soldUrus = vehicles.find(v => v.model === 'Urus');
    const soldPorsche = vehicles.find(v => v.model === '911 GT3 RS');

    await Transaction.bulkCreate([
      {
        user_id: standardUser.id,
        vehicle_id: soldUrus.id,
        type: 'PURCHASE',
        quantity: 1,
        price_at_time: 230000,
        status: 'SUCCESS'
      },
      {
        user_id: standardUser.id,
        vehicle_id: soldPorsche.id,
        type: 'PURCHASE',
        quantity: 1,
        price_at_time: 240000,
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
