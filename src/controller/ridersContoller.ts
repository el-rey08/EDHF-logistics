import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { riderModel } from "../models/ridersModel";
import { generateOTP } from "../utils/otp";
import { hashValue } from "../utils/hash";
import { sendEmail } from "../emails/emailService";
import { verifyEmailOTPTemplate } from "../emails/templates/verifyEmail";

const OTP_EXPIRY_MINUTES = 10;
const OTP_RESEND_COOLDOWN = 1; // minutes
const APP_NAME = "Elisha Global Service LTD";
const MAX_OTP_ATTEMPTS = 5;

// ------------------ RIDER SIGNUP ------------------
export const riderSignup = async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      phoneNumber,
      email,
      password,
      governmentIdType,
      governmentIdNumber,
      vehicle,
    } = req.body;

    // 1️⃣ Validate input
    if (
      !fullName ||
      !phoneNumber ||
      !password ||
      !governmentIdType ||
      !governmentIdNumber ||
      !vehicle?.type ||
      !vehicle?.plateNumber
    ) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    // 2️⃣ Check if rider exists
    const existingRider = await riderModel.findOne({
      $or: [{ phoneNumber }, { governmentIdNumber }],
    });

    if (existingRider) {
      return res.status(409).json({
        message: "Rider already exists",
      });
    }

    // 3️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4️⃣ Generate OTP
    const otp = generateOTP();
    const hashedOTP = await hashValue(otp);

    // 5️⃣ Create rider
    const rider = await riderModel.create({
      fullName,
      phoneNumber,
      email: email?.toLowerCase(),
      password: hashedPassword,
      governmentIdType,
      governmentIdNumber,
      vehicle,
      status: "pending",
      isAvailable: false,
      emailOTP: hashedOTP,
      otpExpiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000),
      otpAttempts: 0,
      otpLastSentAt: new Date(),
    });

    // 6️⃣ Send OTP email
    if (email) {
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
    }

    return res.status(201).json({
      message: "Signup successful. Please verify your email.",
      riderId: rider._id, // safer to return only id
    });
  } catch (error: any) {
    console.error("Rider signup error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------ VERIFY EMAIL OTP ------------------
export const verifyEmailOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const rider = await riderModel
      .findOne({ email: email.toLowerCase() })
      .select("+emailOTP +otpExpiresAt +otpAttempts");

    if (!rider) {
      return res.status(404).json({ message: "User not found" });
    }

    if (rider.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    if (rider.otpAttempts >= MAX_OTP_ATTEMPTS) {
      return res.status(429).json({
        message: "Too many failed attempts. Please request a new OTP.",
      });
    }

    if (!rider.emailOTP || !rider.otpExpiresAt || rider.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: "OTP has expired or not found" });
    }

    const isValid = await bcrypt.compare(String(otp), rider.emailOTP);
    if (!isValid) {
      rider.otpAttempts += 1;
      await rider.save();
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // ✅ OTP valid → mark verified
    rider.isVerified = true;
    rider.emailOTP = null;
    rider.otpExpiresAt = null;
    rider.otpAttempts = 0;
    await rider.save();

    return res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("Email verification error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ------------------ RESEND OTP ------------------
export const resendOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const rider = await riderModel.findOne({ email: email.toLowerCase() });
    if (!rider) return res.status(404).json({ message: "User not found" });

    if (rider.isVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }

    if (
      rider.otpLastSentAt &&
      Date.now() - rider.otpLastSentAt.getTime() < OTP_RESEND_COOLDOWN * 60000
    ) {
      return res.status(429).json({
        message: "Please wait before requesting another OTP",
      });
    }

    const otp = generateOTP();
    rider.emailOTP = await hashValue(otp);
    rider.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000);
    rider.otpAttempts = 0;
    rider.otpLastSentAt = new Date();
    await rider.save();

    const html = verifyEmailOTPTemplate({
      userName: rider.fullName,
      appName: APP_NAME,
      otpCode: otp,
      expiryTime: `${OTP_EXPIRY_MINUTES} minutes`,
      supportEmail: "support@elishaglobal.com",
      currentYear: new Date().getFullYear(),
    });

    await sendEmail({
      to: email.toLowerCase(),
      subject: "Your New OTP - Email Verification",
      html,
    });

    return res.status(200).json({ message: "New OTP sent successfully" });
  } catch (error) {
    console.error("Resend OTP error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
