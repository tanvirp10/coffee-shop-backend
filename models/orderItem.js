'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class OrderItem extends Model {
    static associate(models) {
      OrderItem.belongsTo(models.Order, { foreignKey: 'orderId', onDelete: 'CASCADE' });
    }
  }

  OrderItem.init(
    {
      orderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      menuItemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      customizations: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'OrderItem',
      tableName: 'OrderItems',
      timestamps: true,
    }
  );

  return OrderItem;
};