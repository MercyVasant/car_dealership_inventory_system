const { Sequelize } = require('sequelize');
const { initUserModel } = require('./features/user/User.model');
const { initVehicleModel } = require('./features/inventory/Vehicle.model');
const { initTransactionModel } = require('./features/inventory/Transaction.model');
const { initRefreshTokenModel } = require('./features/auth/RefreshToken.model');

const sequelize = new Sequelize(
  process.env.DB_NAME || 'car_dealership',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || '2810',
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: false,
  }
);

// Initialize Models
const User = initUserModel(sequelize);
const Vehicle = initVehicleModel(sequelize);
const Transaction = initTransactionModel(sequelize);
const RefreshToken = initRefreshTokenModel(sequelize);

// Set up associations
Transaction.belongsTo(User, { foreignKey: 'user_id' });
Transaction.belongsTo(Vehicle, { foreignKey: 'vehicle_id' });
User.hasMany(Transaction, { foreignKey: 'user_id' });
Vehicle.hasMany(Transaction, { foreignKey: 'vehicle_id' });

RefreshToken.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(RefreshToken, { foreignKey: 'user_id' });

module.exports = {
  sequelize,
  User,
  Vehicle,
  Transaction,
  RefreshToken
};
