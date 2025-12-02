import { MenuItem, Customization } from './models/index.js';

const seedData = async () => {
  try {
    // Clear existing data.
    // First, delete all customizations (child records)
    await Customization.destroy({ where: {} });
    // Then, delete all menu items (parent records)
    await MenuItem.destroy({ where: {} });

    // Seed Menu Items
    await MenuItem.bulkCreate([
      {
        name: 'Espresso',
        description: 'A strong and bold coffee shot.',
        price: 2.99,
        category: 'Beverage',
        image: 'https://via.placeholder.com/300x200?text=Espresso',
      },
      {
        name: 'Latte',
        description: 'Smooth espresso with steamed milk.',
        price: 3.49,
        category: 'Beverage',
        image: 'https://via.placeholder.com/300x200?text=Latte',
      },
      {
        name: 'Cappuccino',
        description: 'Espresso topped with foamed milk.',
        price: 3.99,
        category: 'Beverage',
        image: 'https://via.placeholder.com/300x200?text=Cappuccino',
      },
      {
        name: 'Bagel',
        description: 'Freshly baked bagel.',
        price: 2.50,
        category: 'Food',
        image: 'https://via.placeholder.com/300x200?text=Bagel',
      },
    ]);

    console.log('Menu items seeded successfully.');

    // Retrieve seeded items for use in customizations
    const espresso = await MenuItem.findOne({ where: { name: 'Espresso' } });
    const latte = await MenuItem.findOne({ where: { name: 'Latte' } });
    const cappuccino = await MenuItem.findOne({ where: { name: 'Cappuccino' } });

    // Seed Customizations for each menu item
    await Customization.bulkCreate([
      {
        menuItemId: espresso.id,
        type: 'Milk',
        options: JSON.stringify(['Whole Milk', 'Oat Milk', 'Almond Milk']),
        priceAdjustment: JSON.stringify([0.00, 0.50, 0.50]),
      },
      {
        menuItemId: espresso.id,
        type: 'Sugar',
        options: JSON.stringify(['No Sugar', '50%', '100%']),
        priceAdjustment: JSON.stringify([0.00, 0.00, 0.00]),
      },
      {
        menuItemId: latte.id,
        type: 'Espresso Shot',
        options: JSON.stringify(['1 Shot', '2 Shots']),
        priceAdjustment: JSON.stringify([0.50, 1.00]),
      },
      {
        menuItemId: latte.id,
        type: 'Milk',
        options: JSON.stringify(['Whole Milk', 'Soy Milk', 'Oat Milk']),
        priceAdjustment: JSON.stringify([0.00, 0.50, 0.50]),
      },
      {
        menuItemId: cappuccino.id,
        type: 'Milk',
        options: JSON.stringify(['Whole Milk', 'Oat Milk', 'Almond Milk']),
        priceAdjustment: JSON.stringify([0.00, 0.50, 0.50]),
      },
      {
        menuItemId: cappuccino.id,
        type: 'Sugar',
        options: JSON.stringify(['No Sugar', '50%', '100%']),
        priceAdjustment: JSON.stringify([0.00, 0.00, 0.00]),
      },
    ]);

    console.log('Customizations seeded successfully.');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
};

seedData();
