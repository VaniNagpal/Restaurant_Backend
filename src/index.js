import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import UserRouter from './routes/auth.js';
import RestaurantRouter from './routes/restaurant.js';
import verifyJWT from './middleware/verifyJWT.js';

import Stripe from 'stripe';
import User from './models/user.js';
import ErrorWrapper from './utils/ErrorWrapper.js';
import ErrorHandler from './utils/ErrorHandler.js';

const app = express();
const PORT = process.env.PORT || 4444; // Default port if not set
const stripe = Stripe(process.env.STRIPE_SECRET_KEY); // Ensure this environment variable is set

// Middleware setup
app.use(cookieParser());
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json({ limit: '10mb' })); // Increased limit
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' })); // Increased limit
app.use(express.static('public'));

// Routers
app.use('/user', UserRouter);
app.use('/restaurant', verifyJWT, RestaurantRouter);

// Middleware to fetch user data
const getUser = (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ message: "User not authenticated" });
    }
    return res.status(200).json({ user });
};

// Protected route to get user information
app.get('/getuser',verifyJWT, getUser);

// Create checkout session for Stripe
app.post('/create-checkout-session', async (req, res) => {
    const { items } = req.body;
  console.log(items);
    try {
        if (!items || !items.length) {
            return res.status(400).json({ error: 'No items provided' });
        }

        const lineItems = items.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name || 'Total Price',
                },
                unit_amount: Math.round(item.price * 100), // Ensure price is in cents
            },
            quantity: item.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `${process.env.CLIENT_URL}/success`,
            cancel_url: `${process.env.CLIENT_URL}/cancel`,
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ 
            error: 'Failed to create checkout session',
            details: error.message
        });
    }
});

// Handle checkout success and update order history
app.post('/checkout-success', async (req, res) => {
    const { userId } = req.body;

    try {
        // Fetch the user's cart
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the cart is empty
        if (user.cart.length === 0) {
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // Calculate the total price of the cart
        const totalPrice = user.cart.reduce((acc, item) => acc + (item.totalPrice || 0), 0);

        // Add the cart items to the order history
        const newOrder = {
            items: user.cart.map(item => ({
                name: item.food.name,
                price: item.totalPrice,
                quantity: item.quantity,
                id: item.food._id
            })),
            totalPrice, // Include totalPrice here
            date: new Date()
        };

        user.orderHistory.push(newOrder);

        // Empty the cart
        user.cart = [];

        // Save the user with updated order history and empty cart
        await user.save();

        res.json({ message: 'Order processed successfully' });
    } catch (error) {
        console.error('Error processing order:', error);
        res.status(500).json({ error: 'Failed to process order' });
    }
});


app.post('/logout', async (req, res) => {
    try {
        // Clear cookies from the response
        res.clearCookie('AccessToken');
        res.clearCookie('RefreshToken');
        
        // Optionally, you might want to invalidate tokens server-side or clear user sessions
        // If you're using server-side session management, you would clear the session here
        
        // If your tokens are stored in a database or Redis, you might want to invalidate them

        // Send a success response
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Error during logout:', error);
        res.status(500).json({ error: 'Failed to log out' });
    }
});
app.get('/getorderhistory', verifyJWT, async (req, res) => {
    try {
        // Fetch the user from the database using the user ID from the request
        const user = await User.findById(req.user._id).select('orderHistory');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Return the order history
        res.json({
            success: true,
            user: {
                orderHistory: user.orderHistory
            }
        });
    } catch (error) {
        console.error('Error fetching order history:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// MongoDB connection and server start
mongoose.connect(`${process.env.DB_PATH}/${process.env.DB_NAME}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('Database connection error:', err);
    });
