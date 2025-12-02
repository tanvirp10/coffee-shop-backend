import express from 'express';
import Stripe from 'stripe';
import cors from 'cors';

// Initialize Stripe with your secret key
const stripe = new Stripe('your-secret-key', { apiVersion: '2022-11-15' }); // Replace 'your-secret-key' with your actual Stripe secret key

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Route to create a PaymentIntent
app.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount } = req.body;

    // Create a PaymentIntent with the specified amount in cents
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method_types: ['card'],
    });

    // Send the client secret to the frontend
    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Stripe server running on port ${PORT}`));

export default app;
