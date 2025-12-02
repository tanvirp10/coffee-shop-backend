'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class MenuItem extends Model {
    static associate(models) {
      MenuItem.hasMany(models.Customization, { 
        foreignKey: 'menuItemId', 
        onDelete: 'CASCADE' 
      });
    }
  }

  MenuItem.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,  // Add this line
        validate: {
          notEmpty: true,
        },
      },
      description: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          isDecimal: true,
          min: 0,
        },
      },
      category: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
    },
    {
      sequelize,
      modelName: 'MenuItem',
      tableName: 'MenuItems',
      timestamps: true,
    }
  );

  return MenuItem;
};