import User from '../models/user.js';
import Restaurant from "../models/restaurant.js";
import ErrorWrapper from '../utils/ErrorWrapper.js';
import ErrorHandler from '../utils/ErrorHandler.js';

// Fetch cart items for the logged-in user
export const getCartItems = ErrorWrapper(async (req, res, next) => {
    try {

        const user = await User.findById(req.user._id);
        
        console.log("user",user);
        if (!user) {
            throw new ErrorHandler(404, "User not found!");
        }
        res.status(200).json({
            message: "Cart items fetched successfully!",
            data: user.cart,
        });
    } catch (error) {
        next(new ErrorHandler(error.statusCode || 500, error.message));
    }
});

// Add food item to the cart
export const getAddCart = ErrorWrapper(async (req, res, next) => {
    const { id } = req.params;
    const { restaurant_name, category, quantity = 1 } = req.query;

    try {
        const restaurant = await Restaurant.findOne({ name: restaurant_name });
        if (!restaurant) {
            throw new ErrorHandler(404, `Restaurant with name ${restaurant_name} does not exist!`);
        }

        const { foodItem } = await restaurant.getFoodItem(category, id);
        if (!foodItem) {
            throw new ErrorHandler(404, `Food item with id ${id} not found!`);
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            throw new ErrorHandler(404, "User not found!");
        }

        const existingFoodIndex = user.cart.findIndex(item => item.food._id.toString() === foodItem._id.toString());

        if (existingFoodIndex === -1) {
            user.cart.unshift({ food: foodItem, quantity: +quantity });
        } else {
            user.cart[existingFoodIndex].quantity += +quantity;
        }

        await user.save();

        res.status(200).json({
            message: 'Food item added to cart successfully!',
            data: user.cart,
        });
    } catch (error) {
        next(new ErrorHandler(error.statusCode || 500, error.message));
    }
});

// Increase quantity of a cart item
export const getCartItemIncrease = ErrorWrapper(async (req, res, next) => {
    const { id } = req.params;
    const { restaurant_name, category } = req.query;

    try {
        const restaurant = await Restaurant.findOne({ name: restaurant_name });
        if (!restaurant) {
            throw new ErrorHandler(404, `Restaurant with name ${restaurant_name} does not exist!`);
        }

        const { foodItem } = await restaurant.getFoodItem(category, id);
        if (!foodItem) {
            throw new ErrorHandler(404, `Food item with id ${id} not found!`);
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            throw new ErrorHandler(404, "User not found!");
        }

        const existingFoodIndex = user.cart.findIndex(item => item.food._id.toString() === foodItem._id.toString());

        if (existingFoodIndex === -1) {
            throw new ErrorHandler(404, `Food item with id ${id} is not in your cart!`);
        }

        user.cart[existingFoodIndex].quantity++;
        await user.save();

        res.status(200).json({
            message: "Cart item quantity increased successfully!",
            data: user.cart,
        });
    } catch (error) {
        next(new ErrorHandler(error.statusCode || 500, error.message));
    }
});

// Decrease quantity of a cart item
export const getCartItemDecrease = ErrorWrapper(async (req, res, next) => {
    const { id } = req.params;
    const { restaurant_name, category } = req.query;

    try {
        const restaurant = await Restaurant.findOne({ name: restaurant_name });
        if (!restaurant) {
            throw new ErrorHandler(404, `Restaurant with name ${restaurant_name} does not exist!`);
        }

        const { foodItem } = await restaurant.getFoodItem(category, id);
        if (!foodItem) {
            throw new ErrorHandler(404, `Food item with id ${id} not found!`);
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            throw new ErrorHandler(404, "User not found!");
        }

        const existingFoodIndex = user.cart.findIndex(item => item.food._id.toString() === foodItem._id.toString());

        if (existingFoodIndex === -1) {
            throw new ErrorHandler(404, `Food item with id ${id} is not in your cart!`);
        }

        user.cart[existingFoodIndex].quantity--;

        if (user.cart[existingFoodIndex].quantity < 1) {
            user.cart.splice(existingFoodIndex, 1);
        }

        await user.save();

        res.status(200).json({
            message: 'Cart item quantity decreased successfully!',
            data: user.cart,
        });
    } catch (error) {
        next(new ErrorHandler(error.statusCode || 500, error.message));
    }
});

// Delete a cart item
export const getCartItemDelete = ErrorWrapper(async (req, res, next) => {
    const { id } = req.params;
    const { restaurant_name, category } = req.query;

    try {
        const restaurant = await Restaurant.findOne({ name: restaurant_name });
        if (!restaurant) {
            throw new ErrorHandler(404, `Restaurant with name ${restaurant_name} does not exist!`);
        }

        const { foodItem } = await restaurant.getFoodItem(category, id);
        if (!foodItem) {
            throw new ErrorHandler(404, `Food item with id ${id} not found!`);
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            throw new ErrorHandler(404, "User not found!");
        }

        const existingFoodIndex = user.cart.findIndex(item => item.food._id.toString() === foodItem._id.toString());

        if (existingFoodIndex === -1) {
            throw new ErrorHandler(404, `Food item with id ${id} is not in your cart!`);
        }

        user.cart.splice(existingFoodIndex, 1);
        await user.save();

        res.status(200).json({
            message: "Cart item deleted successfully!",
            data: user.cart,
        });
    } catch (error) {
        next(new ErrorHandler(error.statusCode || 500, error.message));
    }
});
