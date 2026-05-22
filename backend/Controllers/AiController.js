import OpenAI from "openai";
import { user } from "../db/Mongodb.js";
import dotenv from "dotenv";
dotenv.config();


const Ai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
});

export const generateArticle = async (req, res) => {
    try {
        const { prompt } = req.body;
        const userId = req.user;
        if (!prompt) {
            return res.status(400).json({ success: false, message: "Prompt is required" });
        }
        const isExistingUser = await user.findById(userId);
        if (!isExistingUser) {

            return res.status(404).json({
                success: false,
                message: "User not found"
            });

        }
        if (isExistingUser.plan === "free") {
            if (isExistingUser.planCount < 20) {

                const response = await Ai.chat.completions.create({
                    model: "gemini-3-flash-preview",
                    messages: [
                        {
                            role: "user",
                            content: prompt,
                        }
                    ]
                });
                const content = response.choices[0].message.content;

                const updatePlanCount = await user.findByIdAndUpdate(userId,
                    {
                        $inc: { planCount: 1 },
                        $push: {
                            aiHistory: {
                                prompt,
                                response: content
                            },
                        }
                    },
                        {returnDocument: "after"});


                return res.json(content);
            }
            else {
                return res.status(400).json({ success: false, message: " Free Plan Expired Please Upgrade to Premium Plan" });
            }
        }
        else {

            const response = await Ai.chat.completions.create({
                model: "gemini-3-flash-preview",
                messages: [
                    {
                        role: "user",
                        content: prompt,
                    },
                ]
            });
            const content = response.choices[0].message.content;

            const updatePlanCount = await user.findByIdAndUpdate(userId,
                {
                    $push: {
                        aiHistory: {
                            prompt,
                            response: content
                        }
                    }
                });


            return res.json(content);
        }

    }
    catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}