import express from "express";
import dotenv from "dotenv";
dotenv.config();
import passport from "../config/passport.js";
import { getUser, createUser, login, upgradePlan, googleCallBack,sendOtp,verifyOtp,resetPassword,dashboardData } from "../Controllers/userController.js"
import { verifyToken,verifyPasswordToken } from "../Middlewares/userMiddleware.js"
import { user } from "../db/Mongodb.js";

const route = express.Router();

//View User
route.get("/view", getUser);


//View Looged User
route.get("/view/logged", verifyToken,dashboardData);

//Create User
route.post("/create", createUser);

//Login User
route.post("/login", login);

//update User
route.patch("/upgrade", verifyToken, upgradePlan);

//Send OTP
route.post("/send-otp",sendOtp)

//Verify OTP
route.post("/verify-otp",verifyPasswordToken,verifyOtp)

//reset Password 
route.post("/reset-password",verifyPasswordToken,resetPassword)

// START GOOGLE LOGIN
route.get("/google", passport.authenticate("google", {
    scope: ["profile", "email"]
})
);

// GOOGLE CALLBACK
route.get("/google/callback", passport.authenticate("google",
    {
        session: false,
        failureRedirect: `${process.env.CLIENT_URL}/login`,
    }),
    googleCallBack);

// GET LOGGED USER
route.get("/me" ,verifyToken,(req,res)=>{
    res.json(req.user);
})


export default route;