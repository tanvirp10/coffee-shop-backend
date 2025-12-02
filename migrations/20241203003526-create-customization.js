'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Customizations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      menuItemId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'MenuItems', // Ensure this matches the name of your MenuItems table
          key: 'id',
        },
        onDelete: 'CASCADE', // Optional: If a menu item is deleted, delete its customizations
        onUpdate: 'CASCADE',
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      options: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      priceAdjustment: {
        type: Sequelize.JSON,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Customizations');
  },
};
