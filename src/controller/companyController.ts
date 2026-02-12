import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { companyModel } from "../models/companyModel";
import { riderModel } from "../models/ridersModel";
import { generateOTP } from "../utils/otp";
import { hashValue } from "../utils/hash";
import { sendEmail } from "../emails/emailService";
import { verifyEmailOTPTemplate } from "../emails/templates/verifyEmail";
import cloudinary from "../utils/cloudinary";
import { blacklistModel } from "../models/blacklistModel";

import fs from "fs";

const OTP_EXPIRY_MINUTES = 10;
const OTP_RESEND_COOLDOWN = 1; // minutes
const APP_NAME = "elisha global service LTD";
const MAX_OTP_ATTEMPTS = 5;

export const createCompany = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      companyName,
      companyEmail,
      companyPassword,
      confirmPassword,
      companyAddress,
      companyPhone,
    } = req.body;

    // 🔍 Validate required fields
    if (
      !companyName ||
      !companyEmail ||
      !companyPassword ||
      !confirmPassword ||
      !companyAddress ||
      !companyPhone
    ) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    if (companyPassword !== confirmPassword) {
      res.status(400).json({ message: "Passwords do not match" });
      return;
    }

    // 🔎 Check existing company
    const existingCompany = await companyModel.findOne({
      companyEmail: companyEmail.toLowerCase(),
    });

    if (existingCompany) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(companyPassword, 10);

    // 🔢 Generate OTP
    const otp = generateOTP();
    const hashedOTP = await hashValue(otp);

    // ☁️ Cloudinary Upload (optional image)
    let companyProfile: string | undefined;

    const file = req.file;
    if (file) {
      const uploadedImage = await cloudinary.uploader.upload(file.path, {
        folder: "uploads",
      });

      companyProfile = uploadedImage.secure_url;

      // 🧹 Remove file from local storage
      fs.unlink(file.path, (err) => {
        if (err) {
          console.error("Failed to delete local file:", err);
        }
      });
    }

    // 👤 Create company
    const company = new companyModel({
      companyName,
      companyEmail: companyEmail.toLowerCase(),
      companyPassword: hashedPassword,
      companyAddress,
      companyPhone,
      companyProfile,
      role: "admin",
      emailOTP: hashedOTP,
      otpExpiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
      otpAttempts: 0,
      otpLastSentAt: new Date(),
    });

    await company.save();

    // 📧 Send OTP email
    const html = verifyEmailOTPTemplate({
      userName: companyName,
      appName: APP_NAME,
      otpCode: otp,
      expiryTime: `${OTP_EXPIRY_MINUTES} minutes`,
      supportEmail: "support@elishagloballogistics2025@gmail.com",
      currentYear: new Date().getFullYear(),
    });

    await sendEmail({
      to: companyEmail.toLowerCase(),
      subject: "Verify Your Email - OTP Code",
      html,
    });

    res.status(201).json({
      message: "Company created successfully. OTP sent to email.",
      data: company,
    });
  } catch (err: any) {
    res.status(500).json({
      message: "Server error",
      err: err.message,
    });
  }
};

export const loginCompany = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyEmail, companyPassword } = req.body;

    const company = await companyModel.findOne({ companyEmail: companyEmail.toLowerCase() });
    if (!company) {
      res.status(404).json({ message: "Company not found" });
      return;
    }

    const isMatch = await bcrypt.compare(companyPassword, company.companyPassword);
    if (!isMatch) {
      res.status(400).json({ message: "Incorrect password" });
      return;
    }

    if (!company.isVerified) {
      res.status(403).json({ message: "Email not verified" });
      return;
    }

    const token = jwt.sign(
      { companyId: company._id, companyEmail: company.companyEmail, role: company.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "1d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      data: company.companyName
    });

  } catch (err: any) {
    res.status(500).json({ message: "Server error", err: err.message });
  }
};

export const verifyEmailOTPCompany = async (req: any, res: any) => {
  const { companyEmail, otp } = req.body;

  if (!companyEmail || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

  const company = await companyModel.findOne({ companyEmail });
  if (!company) {
    return res.status(404).json({ message: "Company not found" });
  }

  if (company.isVerified) {
    return res.status(400).json({ message: "Email already verified" });
  }

  if (company.otpAttempts >= MAX_OTP_ATTEMPTS) {
    return res.status(429).json({
      message: "Too many failed attempts. Please request a new OTP.",
    });
  }

  if (!company.otpExpiresAt || company.otpExpiresAt < new Date()) {
    return res.status(400).json({ message: "OTP has expired" });
  }

  if (!company.emailOTP) {
    return res.status(400).json({ message: "OTP not found" });
  }

  const isValid = await bcrypt.compare(otp, company.emailOTP);
  if (!isValid) {
    company.otpAttempts += 1;
    await company.save();

    return res.status(400).json({ message: "Invalid OTP" });
  }

  company.isVerified = true;
  company.emailOTP = undefined!;
  company.otpExpiresAt = undefined!;
  company.otpAttempts = 0;
  await company.save();

  const token = jwt.sign(
      {
        companyId: company._id,
        companyEmail: company.companyEmail,
        role: company.role,
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Account verified successfully",
      token,
      company: {
        id: company._id,
        companyEmail: company.companyEmail,
        role: company.role,
      },
    });
  };

export const resendOTPCompany = async (req: any, res: any) => {
  const { companyEmail } = req.body;

  if (!companyEmail) {
    return res.status(400).json({ message: "Email is required" });
  }

  const existingCompany = await companyModel.findOne({ companyEmail });
  if (!existingCompany) {
    return res.status(404).json({ message: "Company not found" });
  }

  if (existingCompany.isVerified) {
    return res.status(400).json({ message: "Email already verified" });
  }

  if (
    existingCompany.otpLastSentAt &&
    Date.now() - existingCompany.otpLastSentAt.getTime() <
      OTP_RESEND_COOLDOWN * 60000
  ) {
    return res.status(429).json({
      message: "Please wait before requesting another OTP",
    });
  }

  const otp = generateOTP();
  existingCompany.emailOTP = await hashValue(otp);
  existingCompany.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000);
  existingCompany.otpAttempts = 0;
  existingCompany.otpLastSentAt = new Date();
  await existingCompany.save();

  const html = verifyEmailOTPTemplate({
    userName: existingCompany.companyName,
    appName: APP_NAME,
    otpCode: otp,
    expiryTime: `${OTP_EXPIRY_MINUTES} minutes`,
    supportEmail: "support@elishagloballogistics2025@gmail.com",
    currentYear: new Date().getFullYear(),
  });

  await sendEmail({
    to: companyEmail,
    subject: "Your New OTP - Email Verification",
    html,
  });

  res.status(200).json({
    message: "New OTP sent successfully",
  });
};

export const forgotPasswordCompany = async (req: any, res: any) => {
  const { companyEmail } = req.body;

  if (!companyEmail) {
    return res.status(400).json({ message: "Email is required" });
  }

  const company = await companyModel.findOne({ companyEmail: companyEmail.toLowerCase() });
  if (!company) {
    return res.status(404).json({ message: "Company not found" });
  }

  if (!company.isVerified) {
    return res.status(403).json({ message: "Email not verified. Please verify your email first." });
  }

  // Generate OTP
  const otp = generateOTP();
  const hashedOTP = await hashValue(otp);

  // Update company with new OTP details
  company.emailOTP = hashedOTP;
  company.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
  company.otpAttempts = 0;
  company.otpLastSentAt = new Date();
  await company.save();

  // Send OTP email (reusing verifyEmailOTPTemplate for simplicity)
  const html = verifyEmailOTPTemplate({
    userName: company.companyName,
    appName: APP_NAME,
    otpCode: otp,
    expiryTime: `${OTP_EXPIRY_MINUTES} minutes`,
    supportEmail: "support@elishagloballogistics2025@gmail.com",
    currentYear: new Date().getFullYear(),
  });

  await sendEmail({
    to: companyEmail.toLowerCase(),
    subject: "Reset Your Password - OTP Code",
    html,
  });

  res.status(200).json({
    message: "Password reset OTP sent to your email.",
  });
};

export const approveRider = async (req: any, res: Response): Promise<void> => {
  try {
    const { riderId } = req.params;

    const rider = await riderModel.findById(riderId);
    if (!rider) {
      res.status(404).json({ message: "Rider not found" });
      return;
    }

    if (rider.status !== "pending") {
      res.status(400).json({ message: "Rider is not pending approval" });
      return;
    }

    rider.status = "approved";
    rider.approvedBy = req.user.companyId; // Reference to the approving company
    await rider.save();

    res.status(200).json({ message: "Rider approved successfully", rider });
  } catch (err: any) {
    res.status(500).json({ message: "Server error", err: err.message });
  }
};

export const declineRider = async (req: any, res: Response): Promise<void> => {
  try {
    const { riderId } = req.params;

    const rider = await riderModel.findById(riderId);
    if (!rider) {
      res.status(404).json({ message: "Rider not found" });
      return;
    }

    if (rider.status !== "pending") {
      res.status(400).json({ message: "Rider is not pending approval" });
      return;
    }

    rider.status = "suspended";
    await rider.save();

    res.status(200).json({ message: "Rider declined successfully", rider });
  } catch (err: any) {
    res.status(500).json({ message: "Server error", err: err.message });
  }
};

export const getPendingRiders = async (req: Request, res: Response): Promise<void> => {
  try {
    const pendingRiders = await riderModel.find({ status: "pending" }).select("-password");
    res.status(200).json({ message: "Pending riders fetched successfully", riders: pendingRiders });
  } catch (err: any) {
    res.status(500).json({ message: "Server error", err: err.message });
  }
};

export const logoutCompany = async (req: any, res: Response): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(" ")[1]; // Extract token from Bearer header

    if (!token) {
      res.status(400).json({ message: "Token is required" });
      return;
    }

    // Decode token to get expiry date
    const decoded: any = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      res.status(400).json({ message: "Invalid token" });
      return;
    }

    const expiresAt = new Date(decoded.exp * 1000); // Convert to milliseconds

    // Add token to blacklist
    const blacklistedToken = new blacklistModel({
      token,
      expiresAt,
    });

    await blacklistedToken.save();

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err: any) {
    res.status(500).json({ message: "Server error", err: err.message });
  }
};


