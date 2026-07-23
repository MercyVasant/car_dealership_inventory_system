'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      buyer_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      vehicle_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'vehicles',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      sale_price: {
        type: Sequelize.DECIMAL,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'PENDING',
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('transactions');
  }
};
