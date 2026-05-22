import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import userRoute from "./Routes/userRoute.js";
import aiRoute from "./Routes/aiRoutes.js";
import passport from "./config/passport.js";

dotenv.config();

const app = express();
app.set("trust proxy", 1);
app.use(express.json());

app.use(cors({
    origin: "https://jasflow-ai.vercel.app",
    credentials: true
}));

app.use(cookieParser());

app.use(passport.initialize());

const connection = async () => {
    try {

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected successfully");

        app.listen(process.env.PORT, () => {
            console.log(`App listening on port ${process.env.PORT}`);
        });

    } catch (err) {

        console.log(err);

    }
};

connection();

app.use("/api/user", userRoute);
app.use("/api/ai", aiRoute);

app.listen(process.env.PORT, () => {
    console.log(`app is listening to port ${process.env.PORT}`)
})
