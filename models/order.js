'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      // Order has many OrderItems
      Order.hasMany(models.OrderItem, { foreignKey: 'orderId', onDelete: 'CASCADE' });
    }
  }

  Order.init(
    {
      // Customer info (no login required)
      customerName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      customerEmail: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      customerPhone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // Order type
      orderType: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pickup',
        validate: {
          isIn: [['pickup', 'delivery']],
        },
      },
      // Delivery address (optional)
      address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      zip: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      // Pricing
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      tax: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      deliveryFee: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      // Additional info
      specialInstructions: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'pending',
        validate: {
          isIn: [['pending', 'preparing', 'ready', 'completed', 'cancelled']],
        },
      },
    },
    {
      sequelize,
      modelName: 'Order',
      tableName: 'Orders',
      timestamps: true,
    }
  );

  return Order;
};