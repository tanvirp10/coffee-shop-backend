import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import config from './config/config.js';
import sequelize from './config/config.js'; // Assuming your Sequelize config is in this file
import db from './models/index.js';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const { MenuItem, Customization, Order, OrderItem } = db;

const app = express();
const SECRET_KEY = 'your_secret_key';

db.sequelize.sync().then(() => {
  console.log('Database synced');
}).catch(err => {
  console.error('Error syncing database:', err);
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://192.168.0.116:5173'],
  credentials: true
}));
app.use(express.json()); // Parse incoming JSON requests

// Mock user data (use a database in production)
const users = [
  { username: 'admin', password: bcrypt.hashSync('password', 10) }, // Pre-hashed password
];

// Login Route
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);

  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid username or password' });
  }

  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ token });
});

// Middleware to Protect Routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(403).json({ message: 'Access denied' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Admin Protected Route
app.get('/admin', authenticateToken, (req, res) => {
  res.json({ message: 'Welcome to the admin dashboard!' });
});

// Root Route
app.get('/', (req, res) => {
  res.send('Welcome to the Mobile Ordering App API!');
});

// Get all menu items with customizations
app.get('/menu', async (req, res) => {
  try {
    const items = await MenuItem.findAll({
      include: [
        {
          model: Customization,
          as: 'Customizations',
        },
      ],
    });
    res.status(200).json(items);
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ message: 'Failed to fetch menu items', error: error.message });
  }
});

// Add a new menu item
app.post('/menu', async (req, res) => {
  try {
    const { name, description, price, category, customizations } = req.body;

    const newItem = await MenuItem.create({ name, description, price, category });

    // Add customizations if provided
    if (customizations && customizations.length) {
      const customizationData = customizations.map((cust) => ({
        ...cust,
        menuItemId: newItem.id,
      }));
      await Customization.bulkCreate(customizationData);
    }

    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ message: 'Failed to create menu item', error: error.message });
  }
});

// Update a menu item and its customizations
app.put('/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { customizations, ...menuData } = req.body;

    const updated = await MenuItem.update(menuData, { where: { id } });
    if (!updated) {
      return res.status(404).json({ message: 'Menu item not found or no changes made' });
    }

    // Update customizations
    if (customizations && customizations.length) {
      await Customization.destroy({ where: { menuItemId: id } }); // Remove old customizations
      const newCustomizations = customizations.map((cust) => ({
        ...cust,
        menuItemId: id,
      }));
      await Customization.bulkCreate(newCustomizations);
    }

    const updatedItem = await MenuItem.findOne({ where: { id }, include: 'customizations' });
    res.status(200).json(updatedItem);
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ message: 'Failed to update menu item', error: error.message });
  }
});

// Delete a menu item and its customizations
app.delete('/menu/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Delete customizations first
    await Customization.destroy({ where: { menuItemId: id } });

    // Delete menu item
    const result = await MenuItem.destroy({ where: { id } });

    if (!result) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ message: 'Failed to delete menu item', error: error.message });
  }
});

// Get customizations for a menu item
app.get('/customizations/:menuItemId', async (req, res) => {
  try {
    const { menuItemId } = req.params;
    const customizations = await Customization.findAll({ where: { menuItemId } });
    res.status(200).json(customizations);
  } catch (error) {
    console.error('Error fetching customizations:', error);
    res.status(500).json({ message: 'Failed to fetch customizations', error: error.message });
  }
});

// Create a new order
app.post('/orders', async (req, res) => {
  try {
    const { customer, orderType, items, subtotal, tax, deliveryFee, total, specialInstructions } = req.body;

    // Create the order
    const order = await Order.create({
      customerName: customer.name,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      orderType,
      address: customer.address || null,
      city: customer.city || null,
      zip: customer.zip || null,
      subtotal,
      tax,
      deliveryFee,
      total,
      specialInstructions,
      status: 'pending'
    });

    // Create order items
    if (items && items.length > 0) {
      const orderItems = items.map(item => ({
        orderId: order.id,
        menuItemId: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        customizations: item.customizations || []
      }));
      await OrderItem.bulkCreate(orderItems);
    }

    // Fetch the complete order with items
    const completeOrder = await Order.findByPk(order.id, {
      include: [{ model: OrderItem }]
    });

    res.status(201).json(completeOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
});

// Get all orders (for admin)
app.get('/orders', authenticateToken, async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [{ model: OrderItem }],
      order: [['createdAt', 'DESC']]
    });
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
});

// Get single order by ID
app.get('/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findByPk(id, {
      include: [{ model: OrderItem }]
    });
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.status(200).json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Failed to fetch order', error: error.message });
  }
});

// Update order status (for admin)
app.patch('/orders/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const order = await Order.findByPk(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    order.status = status;
    await order.save();
    
    res.status(200).json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Failed to update order status', error: error.message });
  }
});

// Create payment intent (Stripe implementation)
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe uses cents
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ message: 'Failed to create payment intent', error: error.message });
  }
});

// Start the server
app.listen(3000, '0.0.0.0', () => {
  console.log('Server running on port 3000');
});

export default app;
