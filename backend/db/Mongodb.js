import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
    },
    phoneNumber: {
        type: String
    },
    plan: {
        type: String,
        default: "free"
    },
    planCount: {
        type: Number,
        default: 0
    },
    aiHistory: [{
        prompt: {
            type: String
        },
        response: {
            type: String
        },
        createdAt: {
            type: Date,
            default: Date.now()
        }
    }],
    googleId: {
        type: String
    },
    authProvider: {
        type: String,
        enum: ["local", "google"],
        default: "local"
    },
    otp: {
        type: String,
        default: null,
    },

    otpExpire: {
        type: Date,
        default: null,
    },

    isOtpVerified: {
        type: Boolean,
        default: false,
    },
},
    { timestamps: true });

export const user =
    mongoose.models.User || mongoose.model("User", userSchema);