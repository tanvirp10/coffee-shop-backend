'use strict';
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Customization extends Model {
    /**
     * Associations
     */
    static associate(models) {
      Customization.belongsTo(models.MenuItem, { foreignKey: 'menuItemId', onDelete: 'CASCADE' });
    }
  }

  /**
   * Model Initialization
   */
  Customization.init(
    {
      menuItemId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'MenuItems', // The name of the table in the database
          key: 'id',
        },
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      options: {
        type: DataTypes.JSON, // Using JSON for complex data
        allowNull: false,
      },
      priceAdjustment: {
        type: DataTypes.JSON, // Using JSON for array of floats
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Customization',
      tableName: 'Customizations', // Explicitly naming the table for consistency
      timestamps: true, // Include createdAt and updatedAt
    }
  );

  return Customization;
};
