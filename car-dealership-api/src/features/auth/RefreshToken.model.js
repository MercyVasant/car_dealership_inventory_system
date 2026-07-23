const { DataTypes } = require('sequelize');

const initRefreshTokenModel = (sequelize) => {
  return sequelize.define('RefreshToken', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    token: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users', // table name
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    is_revoked: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    tableName: 'refresh_tokens',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  });
};

module.exports = { initRefreshTokenModel };
