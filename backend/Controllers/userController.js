import { user } from "../db/Mongodb.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import cookie from "cookie-parser";
import { generateToken } from "../Utils/generateToken.js";
import dotenv from "dotenv";
dotenv.config();
import sendEmail from "../Utils/sendEmail.js";
import { generateOtp } from "../Utils/generateOtp.js";


export const createUser = async (req, res) => {
  try {
    const { userName, phoneNumber, email, password } = req.body;
    if (!userName) {
      return res.status(400).json({ success: false, message: "UserName is Not Found" });
    }
    if (!phoneNumber) {
      return res.status(400).json({ success: false, message: "Phone Number is Not Found" });
    }
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is Not Found" });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: "Password is Not Found" });
    }
    const isExistingUser = await user.findOne({ email });
    if (isExistingUser) {
      return res.status(400).json({ success: false, message: "User Already Exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userData = await new user({
      userName,
      password: hashedPassword,
      email,
      phoneNumber,
      plan: "free",
      planCount: 0
    });
    await userData.save();
    const token = jwt.sign({ id: userData._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "None",
      maxAge: 1000 * 60 * 60 * 24
    });
    return res.status(201).json({ success: true, message: "User Created Successfully" });
  }
  catch (err) {
    return res.status(500).json({ success: false, message: "internal server error" });
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }
    if (!password) {
      return res.status(400).json({ success: false, message: "Password is required" });
    }
    const isExistingUser = await user.findOne({ email });
    if (!isExistingUser) {
      return res.status(400).json({ success: false, message: "User Not Found" });
    }
    const isPasswordMatch = await bcrypt.compare(password, isExistingUser.password);
    if (!isPasswordMatch) {
      return res.status(400).json({ success: false, message: "Invalid Password" });
    }
    const token = jwt.sign({ id: isExistingUser._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "None",
      maxAge: 1000 * 60 * 60 * 24
    });
    return res.status(200).json({ success: true, message: "Login Successfully" });
  }
  catch (err) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

export const upgradePlan = async (req, res) => {
  try {
    const { plan } = req.body;
    const userId = req.user;
    const isExistingUser = await user.findById(userId);
    if (!plan) {
      return res.status(400).json({ success: false, message: "Plan is required" });
    }
    const planUpdate = await user.findByIdAndUpdate(userId, { plan });
    return res.status(200).json({ success: true, message: "Plan Updated Successfully" });

  }
  catch (err) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

export const getUser = async (req, res) => {
  try {
    const getUser = await user.find();
    res.json(getUser);
  }
  catch (err) {
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

export const googleCallBack = (req, res) => {
  try {
    const token = generateToken(req.user);
    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // true in production
      sameSite: "None",
    });
    res.redirect(`${process.env.CLIENT_URL}/generate`);
  }
  catch (err) {
    return res.status(500).json({ success: false, message: "Auth Failed" });
  }
}

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }
    const foundUser = await user.findOne({ email });
    if (!foundUser) {
      return res.status(404).json({
        success: false,
        message: "Email not found",
      });
    }
    const otp = generateOtp();
    foundUser.otp = otp;
    foundUser.otpExpire = Date.now() + 10 * 60 * 1000;
    foundUser.isOtpVerified = false;
    await foundUser.save();
    const token = jwt.sign({ id: foundUser._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.cookie("passwordToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "None",
      maxAge: 1000 * 60 * 60 * 24
    });
    await sendEmail({
      to: email,
      subject: "Password Reset OTP",
      html: `
<div style="
  margin:0;
  padding:0;
  background:#f4f7fb;
  font-family:Arial,sans-serif;
">
  <div style="
    max-width:600px;
    margin:40px auto;
    background:#ffffff;
    border-radius:18px;
    overflow:hidden;
    box-shadow:0 10px 30px rgba(0,0,0,0.08);
  ">

    <div style="
      background:linear-gradient(135deg,#111827,#2563eb);
      padding:35px;
      text-align:center;
    ">
      <h1 style="
        margin:0;
        color:white;
        font-size:32px;
        letter-spacing:1px;
      ">
        JasFlow AI
      </h1>
      <p style="
        color:#dbeafe;
        margin-top:10px;
        font-size:15px;
      ">
        Smart Billing & AI Business Automation
      </p>
    </div>
    <div style="padding:45px 35px; color:#374151;">
      <h2 style="
        margin-top:0;
        font-size:24px;
        color:#111827;
      ">
        Password Reset Verification
      </h2>
      <p style="
        font-size:15px;
        line-height:1.8;
        color:#4b5563;
      ">
        We received a request to reset your password.
        Use the verification code below to continue securely.
      </p>

      <!-- OTP Box -->
      <div style="
        margin:35px 0;
        text-align:center;
      ">
        <div style="
          display:inline-block;
          background:#eff6ff;
          color:#2563eb;
          padding:18px 42px;
          border-radius:14px;
          font-size:36px;
          font-weight:bold;
          letter-spacing:8px;
          border:1px solid #bfdbfe;
        ">
          ${otp}
        </div>
      </div>

      <p style="
        font-size:14px;
        color:#6b7280;
        line-height:1.7;
      ">
        This OTP is valid for <strong>10 minutes</strong>.
        Do not share this code with anyone for security reasons.
      </p>

      <div style="
        margin-top:35px;
        padding-top:25px;
        border-top:1px solid #e5e7eb;
      ">
        <p style="
          font-size:13px;
          color:#9ca3af;
          margin:0;
          line-height:1.7;
        ">
          If you did not request a password reset,
          you can safely ignore this email.
        </p>
      </div>

    </div>
    <div style="
      background:#f9fafb;
      padding:20px;
      text-align:center;
      font-size:12px;
      color:#9ca3af;
    ">
      © 2026 JasFlow AI. All rights reserved.
    </div>

  </div>
</div>
      `,
    });
    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const { otp } = req.body;
    const userId = req.user;
    if (!userId || !otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }
    const foundUser = await user.findById(userId);
    if (!foundUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (foundUser.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (Date.now() > foundUser.otpExpire) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }
    foundUser.isOtpVerified = true;
    foundUser.otp = null;
    foundUser.otpExpire = null;
    await foundUser.save();
    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user
    if (!userId || !password) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
      });
    }
    const foundUser = await user.findById(userId);
    if (!foundUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    if (!foundUser.isOtpVerified) {
      return res.status(300).json({
        success: false,
        message: "Please verify OTP first",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    foundUser.password = hashedPassword;
    foundUser.isOtpVerified = false;
    await foundUser.save();
    res.clearCookie("passwordToken");
    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const dashboardData = async (req, res) => {
  try {
    const userId = req.user;
    const data = await user.findById(userId);
    if (!data) {
      return res.status(401).json({ sucess: false, message: "data not found" });
    }
    res.json(data);
  }
  catch (err) {
    return res.status(400).json({ success: false, message: "Internal Server Error" })
  }
}
