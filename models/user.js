'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Define associations.
     * This method is automatically called in models/index.js.
     */
    static associate(models) {
      // Example association: A user has many orders
      User.hasMany(models.Order, { foreignKey: 'userId', onDelete: 'CASCADE' });
    }
  }

  User.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true, // Ensures the name is not empty
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true, // Ensures email uniqueness
        validate: {
          isEmail: true, // Ensures a valid email format
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          len: [8, 100], // Password must be at least 8 characters
        },
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'customer', // Default role
        validate: {
          isIn: [['customer', 'admin']], // Allowed roles
        },
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'Users', // Explicit table name
      timestamps: true, // Include createdAt and updatedAt
    }
  );

  return User;
};
