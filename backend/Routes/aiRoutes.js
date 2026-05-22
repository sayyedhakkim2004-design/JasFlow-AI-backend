import express from "express";
import {generateArticle} from "../Controllers/AiController.js";
import {verifyToken} from "../Middlewares/userMiddleware.js";

const route=express.Router();

route.post("/generate/article",verifyToken,generateArticle);

export default route;