import  express from "express";
import{postRestaurant,
    postCusineCategoryAdd,
    postAddFoodItem,
    postdeleteCusineCategory,
    postUpdateFoodItem,
    getDeleteFoodItem,
    getFoodItems,
    getFoodItem,
    getAllCusines,
    postAddFoodImage,
    getRestaurants,
    getRestaurant,
    
} from "../controller/restaurant.js";
import {getCartItemIncrease,
    getAddCart,
    getCartItems,
    getCartItemDecrease,
    getCartItemDelete,
    
} from "../controller/cart.js"
import upload from "../utils/multer.js";
const router = express.Router();

router.post('/register', upload.single("coverImage"), postRestaurant);
router.post('/add-cusine-category', postCusineCategoryAdd);
router.post('/add-food-item', upload.single('image'), postAddFoodItem);

router.post('/delete-cusine-category/:id',postdeleteCusineCategory);


router.get('/get-food-items', getFoodItems);
router.get('/get-all-cusines', getAllCusines);




router.get('/all', getRestaurants);



router.get("/view-cart", getCartItems)
router.post('/update-food-item/:id', upload.single('image'), postUpdateFoodItem);
router.get('/:restaurantId', getRestaurant);
router.get('/delete-food-item/:id', getDeleteFoodItem);
router.get('/get-food-item/:id', getFoodItem);

router.post('/add-food-image/:id', upload.array('images', 6), postAddFoodImage);
router.get("/add-cart/:id", getAddCart);
router.get("/increase-cart/:id", getCartItemIncrease);
router.get("/decrease-cart/:id", getCartItemDecrease);
router.get("/delete-cart-item/:id", getCartItemDelete);

export default router