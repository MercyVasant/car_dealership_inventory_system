require('dotenv').config();
const { sequelize, Vehicle } = require('../src/db');

async function addBmw() {
  try {
    await sequelize.authenticate();
    const bmw = await Vehicle.create({
      make: 'BMW',
      model: 'M5 Competition',
      category: 'Sports',
      price: 135000,
      quantity_in_stock: 2,
      image_url: '/images/bmw.png',
    });
    console.log('Successfully added BMW:', bmw.toJSON());
  } catch (error) {
    console.error('Failed to add BMW:', error);
  } finally {
    await sequelize.close();
  }
}

addBmw();
