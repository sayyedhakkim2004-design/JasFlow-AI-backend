import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter=nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.SENDER_EMAIL,
        pass:process.env.EMAIL_PASS
    }
});
export default transporter;