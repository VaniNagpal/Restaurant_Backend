import express from "express";

import mongoose from "mongoose";
import cors from "cors";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import UserRouter from "./routes/auth.js"
import RestaurantRouter from "./routes/restaurant.js";
import verifyJWT from "../src/middleware/verifyJWT.js";
const app = express();
const PORT = process.env.PORT;


app.use(bodyParser.json({ limit: "4kb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "4kb" }));
app.use(express.static('public')); 
app.use(cookieParser());
app.use(cors({
    origin: process.env.CORS_ORIGIN, // Allow requests only from this origin
    methods: ['GET', 'POST'], // Specify allowed methods
    credentials: true // If you need to send cookies or HTTP authentication headers
  }));



app.use("/user",UserRouter);
app.use("/restaurant",verifyJWT,RestaurantRouter);
const getUser = (req, res, next) => {
    const user = req.user;
    if (!user) {
        return res.status(401).json({ user: undefined });
    }
    return res.status(200).json({ user });
}
app.get('/getuser', verifyJWT, getUser);


// Start the server
mongoose.connect(`${process.env.DB_PATH}/${process.env.DB_NAME}`)
    .then(() => {
        app.listen(PORT, () => {
            console.log("http://localhost:" + PORT);
        })
    })
    .catch(err => {
        console.log(err);
    })