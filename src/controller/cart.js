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
        // Find the restaurant
        const restaurant = await Restaurant.findOne({ name: restaurant_name });
        if (!restaurant) {
            throw new ErrorHandler(404, `Restaurant with name ${restaurant_name} does not exist!`);
        }

        // Get the food item from the restaurant
        const { foodItem } = await restaurant.getFoodItem(category, id);
        if (!foodItem) {
            throw new ErrorHandler(404, `Food item with id ${id} not found!`);
        }

        // Find the user
        const user = await User.findById(req.user._id);
        if (!user) {
            throw new ErrorHandler(404, "User not found!");
        }

        // Find the index of the food item in the cart
        const existingFoodIndex = user.cart.findIndex(item => item.food._id.toString() === foodItem._id.toString());

        // Calculate price per item
        const pricePerItem = foodItem.price; // Assuming price is in the foodItem object

        if (existingFoodIndex === -1) {
            // Add new item to the cart
            user.cart.unshift({ 
                food: foodItem, 
                quantity: +quantity, 
                totalPrice: +quantity * pricePerItem 
            });
        } else {
            // Update existing item in the cart
            user.cart[existingFoodIndex].quantity += +quantity;
            user.cart[existingFoodIndex].totalPrice = user.cart[existingFoodIndex].quantity * pricePerItem;
        }

        // Save user changes
        await user.save();

        res.status(200).json({
            message: 'Food item added to cart successfully!',
            data: {
                cart: user.cart,
            },
        });
    } catch (error) {
        next(new ErrorHandler(error.statusCode || 500, error.message));
    }
});



// Increase quantity of a cart item
export const getCartItemIncrease = ErrorWrapper(async (req, res, next) => {
    const { id } = req.params;
    
    try {
        // Find the user
        const user = await User.findById(req.user._id);
        if (!user) {
            throw new ErrorHandler(404, "User not found!");
        }

        // Find the index of the cart item to be increased
        const existingCartIndex = user.cart.findIndex(item => item._id.toString() === id.toString());

        if (existingCartIndex === -1) {
            throw new ErrorHandler(404, `Food item with id ${id} is not in your cart!`);
        }

        // Increase the quantity
        user.cart[existingCartIndex].quantity++;
        
        // Optionally, update totalPrice if needed
        user.cart[existingCartIndex].totalPrice = user.cart[existingCartIndex].quantity * user.cart[existingCartIndex].food.price;

        // Save changes
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

    try {
        // Find the user
        const user = await User.findById(req.user._id);
        if (!user) {
            throw new ErrorHandler(404, "User not found!");
        }

        // Find the index of the cart item to be decreased
        const existingCartIndex = user.cart.findIndex(item => item._id.toString() === id.toString());

        if (existingCartIndex === -1) {
            throw new ErrorHandler(404, `Food item with id ${id} is not in your cart!`);
        }

        // Decrease the quantity
        user.cart[existingCartIndex].quantity--;

        // Remove the item if quantity is less than 1
        if (user.cart[existingCartIndex].quantity < 1) {
            user.cart.splice(existingCartIndex, 1);
        } else {
            // Update totalPrice if needed
            user.cart[existingCartIndex].totalPrice = user.cart[existingCartIndex].quantity * user.cart[existingCartIndex].food.price;
        }

        // Save changes
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

    try {
        // Find the user
        const user = await User.findById(req.user._id);
        if (!user) {
            throw new ErrorHandler(404, "User not found!");
        }

        // Find the index of the cart item to be deleted
        const existingCartIndex = user.cart.findIndex(item => item._id.toString() === id.toString());

        if (existingCartIndex === -1) {
            throw new ErrorHandler(404, `Cart item with id ${id} not found!`);
        }

        // Remove the item from the cart
        user.cart.splice(existingCartIndex, 1);

        // Save changes
        await user.save();

        res.status(200).json({
            message: "Cart item deleted successfully!",
            data: user.cart,
        });
    } catch (error) {
        next(new ErrorHandler(error.statusCode || 500, error.message));
    }
});
