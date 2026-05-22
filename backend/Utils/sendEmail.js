import dotenv from "dotenv";
dotenv.config();
import transporter from "../config/mail.js";

const sendEmail=async({to,subject,html})=>{
    try{
        await transporter.sendMail({
            from:process.env.SENDER_EMAIL,
            to,
            subject,
            html
        });

    }
    catch(err){
        console.log(err);
    }
}
export default sendEmail;