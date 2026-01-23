import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { userModel } from "../models/userModel";
import { generateOTP } from "../utils/otp";
import { hashValue } from "../utils/hash";
import { sendEmail } from "../emails/emailService";
import { verifyEmailOTPTemplate } from "../emails/templates/verifyEmail";
import cloudinary from "../utils/cloudinary";
import fs from "fs";


const OTP_EXPIRY_MINUTES = 10;
const OTP_RESEND_COOLDOWN = 1; // minutes
const APP_NAME = "elisha global service LTD";
const MAX_OTP_ATTEMPTS = 5;

export const createUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      fullName,
      email,
      password,
      confirmPassword,
      phoneNumber,
      address,
    } = req.body;

    // 🔍 Validate required fields
    if (
      !fullName ||
      !email ||
      !password ||
      !confirmPassword ||
      !phoneNumber ||
      !address
    ) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ message: "Passwords do not match" });
      return;
    }

    // 🔎 Check existing user
    const existingUser = await userModel.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔢 Generate OTP
    const otp = generateOTP();
    const hashedOTP = await hashValue(otp);

    // ☁️ Cloudinary Upload (optional image)
    let profileImage: string | undefined;

    const file = req.file 
    if (file) {
      const uploadedImage = await cloudinary.uploader.upload(file.path, {
        folder: "uploads",
      });

      profileImage = uploadedImage.secure_url;

      // 🧹 Remove file from local storage
      fs.unlink(file.path, (err) => {
        if (err) {
          console.error("Failed to delete local file:", err);
        }
      });
    }

    // 👤 Create user
    const user = new userModel({
      fullName,
      email: email.toLowerCase(),
      password: hashedPassword,
      phoneNumber,
      address,
      profileImage,
      emailOTP: hashedOTP,
      otpExpiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
      otpAttempts: 0,
      otpLastSentAt: new Date(),
    });

    await user.save();

    // 📧 Send OTP email
    const html = verifyEmailOTPTemplate({
      userName: fullName,
      appName: APP_NAME,
      otpCode: otp,
      expiryTime: `${OTP_EXPIRY_MINUTES} minutes`,
      supportEmail: "support@elishagloballogistics2025@gmail.com",
      currentYear: new Date().getFullYear(),
    });

    await sendEmail({
      to: email.toLowerCase(),
      subject: "Verify Your Email - OTP Code",
      html,
    });

    res.status(201).json({
      message: "User created successfully. OTP sent to email.",
      data: user,
    });
  } catch (err: any) {
    res.status(500).json({
      message: "Server error",
      err: err.message,
    });
  }
};




export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Incorrect password" });
      return;
    }

    if (!user.isVerified) {
      res.status(403).json({ message: "Email not verified" });
      return;
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      data: user.fullName
    });

  } catch (err: any) {
    res.status(500).json({ message: "Server error", err: err.message });
  }
};



export const getOneUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await userModel.findById(id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ message: "User fetched successfully", data: user });

  } catch (err: any) {
    res.status(500).json({ message: "Server error", err: err.message });
  }
};

export const getAllUser = async (req:Request, res:Response) :Promise<void> => {
  try {
    const getUsers = await userModel.find()
    if(!getUsers){
      res.status(404).json({message:"Users not found"});
      return;
    }
    res.status(200).json({message:"Users fetched successfully",data:getUsers});
  } catch (err: any) {
    res.status(500).json({ message: "Server error", err: err.message });
  }
}

export const updateProfile = async (req: any, res: Response): Promise<void> => {
  try {
    const { fullName, address, phoneNumber } = req.body;

    const updatedUser = await userModel.findByIdAndUpdate(
      req.user.userId,
      { fullName, address, phoneNumber },
      { new: true }
    );

    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "Profile updated successfully",
      data: updatedUser
    });

  } catch (err: any) {
    res.status(500).json({ message: "Server error", err: err.message });
  }
};


export const changePassword = async (req: any, res: Response): Promise<void> => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      res.status(400).json({ message: "Passwords do not match" });
      return;
    }

    const user = await userModel.findById(req.user.userId);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      res.status(400).json({ message: "Old password incorrect" });
      return;
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });

  } catch (err: any) {
    res.status(500).json({ message: "Server error", err: err.message });
  }
};

export const verifyEmailOTP = async (req: any, res: any) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

  const user = await userModel.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  if (user.isVerified) {
    return res.status(400).json({ message: "Email already verified" });
  }

  if (user.otpAttempts >= MAX_OTP_ATTEMPTS) {
    return res.status(429).json({
      message: "Too many failed attempts. Please request a new OTP.",
    });
  }

  if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
    return res.status(400).json({ message: "OTP has expired" });
  }

  

  if (!user.emailOTP) {
    return res.status(400).json({ message: "OTP not found" });
  }

  const isValid = await bcrypt.compare(otp, user.emailOTP);
  if (!isValid) {
    user.otpAttempts += 1;
    await user.save();

    return res.status(400).json({ message: "Invalid OTP" });
  }

  user.isVerified = true;
  user.emailOTP = undefined!;
  user.otpExpiresAt = undefined!;
  user.otpAttempts = 0;
  await user.save();

  const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Account verified successfully",
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });
  };

export const resendOTP = async (req: any, res: any) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const existingUser = await userModel.findOne({ email });
  if (!existingUser) {
    return res.status(404).json({ message: "User not found" });
  }

  if (existingUser.isVerified) {
    return res.status(400).json({ message: "Email already verified" });
  }

  if (
    existingUser.otpLastSentAt &&
    Date.now() - existingUser.otpLastSentAt.getTime() <
      OTP_RESEND_COOLDOWN * 60000
  ) {
    return res.status(429).json({
      message: "Please wait before requesting another OTP",
    });
  }

  const otp = generateOTP();
  existingUser.emailOTP = await hashValue(otp);
  existingUser.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000);
  existingUser.otpAttempts = 0;
  existingUser.otpLastSentAt = new Date();
  await existingUser.save();

  const html = verifyEmailOTPTemplate({
    userName: existingUser.fullName,
    appName: APP_NAME,
    otpCode: otp,
    expiryTime: `${OTP_EXPIRY_MINUTES} minutes`,
    supportEmail: "support@elishaglobal.com",
    currentYear: new Date().getFullYear(),
  });

  await sendEmail({
    to: email,
    subject: "Your New OTP - Email Verification",
    html,
  });

  res.status(200).json({
    message: "New OTP sent successfully",
  });
};
