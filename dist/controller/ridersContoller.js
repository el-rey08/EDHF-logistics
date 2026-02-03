"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.forgotPassword = exports.resendOTP = exports.verifyEmailOTP = exports.login = exports.riderSignup = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const ridersModel_1 = require("../models/ridersModel");
const otp_1 = require("../utils/otp");
const hash_1 = require("../utils/hash");
const emailService_1 = require("../emails/emailService");
const verifyEmail_1 = require("../emails/templates/verifyEmail");
const cloudinary_1 = __importDefault(require("../utils/cloudinary"));
const fs_1 = __importDefault(require("fs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const blacklistModel_1 = require("../models/blacklistModel");
const OTP_EXPIRY_MINUTES = 10;
const OTP_RESEND_COOLDOWN = 1; // minutes
const APP_NAME = "Elisha Global Service LTD";
const MAX_OTP_ATTEMPTS = 5;
// ------------------ RIDER SIGNUP ------------------
const riderSignup = async (req, res) => {
    try {
        const { fullName, phoneNumber, email, password, confirmPassword, governmentIdType, governmentIdNumber, vehicle, } = req.body;
        // 1️⃣ Validate input
        if (!fullName ||
            !phoneNumber ||
            !password ||
            !confirmPassword ||
            !governmentIdType ||
            !governmentIdNumber ||
            !vehicle?.type ||
            !vehicle?.plateNumber) {
            return res.status(400).json({
                message: "All required fields must be provided",
            });
        }
        if (password !== confirmPassword) {
            res.status(400).json({ message: "Passwords do not match" });
            return;
        }
        // 2️⃣ Check if rider exists
        const existingRider = await ridersModel_1.riderModel.findOne({
            $or: [{ phoneNumber }, { governmentIdNumber }],
        });
        if (existingRider) {
            return res.status(409).json({
                message: "Rider already exists",
            });
        }
        // 3️⃣ Hash password
        const hashedPassword = await bcrypt_1.default.hash(password, 12);
        // 4️⃣ Generate OTP
        const otp = (0, otp_1.generateOTP)();
        const hashedOTP = await (0, hash_1.hashValue)(otp);
        let profileImage;
        const file = req.file;
        if (file) {
            const uploadedImage = await cloudinary_1.default.uploader.upload(file.path, {
                folder: "uploads",
            });
            profileImage = uploadedImage.secure_url;
            // 🧹 Remove file from local storage
            fs_1.default.unlink(file.path, (err) => {
                if (err) {
                    console.error("Failed to delete local file:", err);
                }
            });
        }
        // 5️⃣ Create rider
        const rider = new ridersModel_1.riderModel({
            fullName,
            phoneNumber,
            email: email?.toLowerCase(),
            password: hashedPassword,
            governmentIdType,
            governmentIdNumber,
            vehicle,
            profileImage,
            status: "pending",
            isAvailable: false,
            emailOTP: hashedOTP,
            otpExpiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000),
            otpAttempts: 0,
            otpLastSentAt: new Date(),
        });
        await rider.save();
        // 6️⃣ Send OTP email
        if (email) {
            const html = (0, verifyEmail_1.verifyEmailOTPTemplate)({
                userName: fullName,
                appName: APP_NAME,
                otpCode: otp,
                expiryTime: `${OTP_EXPIRY_MINUTES} minutes`,
                supportEmail: "support@elishagloballogistics2025@gmail.com",
                currentYear: new Date().getFullYear(),
            });
            await (0, emailService_1.sendEmail)({
                to: email.toLowerCase(),
                subject: "Verify Your Email - OTP Code",
                html,
            });
        }
        return res.status(201).json({
            message: "Signup successful. Please verify your email.",
            riderId: rider._id, // safer to return only id
        });
    }
    catch (error) {
        console.error("Rider signup error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.riderSignup = riderSignup;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const rider = await ridersModel_1.riderModel.findOne({ email: email.toLowerCase() });
        if (!rider) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const isMatch = await bcrypt_1.default.compare(password, rider.password);
        if (!isMatch) {
            res.status(400).json({ message: "Incorrect password" });
            return;
        }
        if (!rider.isVerified) {
            res.status(403).json({ message: "Email not verified" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: rider._id, email: rider.email }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.status(200).json({
            message: "Login successful",
            token,
            data: rider.fullName
        });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", err: err.message });
    }
};
exports.login = login;
// ------------------ VERIFY EMAIL OTP ------------------
const verifyEmailOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }
        const rider = await ridersModel_1.riderModel
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
        const isValid = await bcrypt_1.default.compare(String(otp), rider.emailOTP);
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
        const token = jsonwebtoken_1.default.sign({
            userId: rider._id,
            email: rider.email,
            role: rider.role,
        }, process.env.JWT_SECRET, { expiresIn: "7d" });
        return res.status(200).json({
            message: "Account verified successfully",
            token,
            user: {
                id: rider._id,
                email: rider.email,
                role: rider.role,
            },
        });
    }
    catch (error) {
        console.error("Email verification error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.verifyEmailOTP = verifyEmailOTP;
// ------------------ RESEND OTP ------------------
const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email)
            return res.status(400).json({ message: "Email is required" });
        const rider = await ridersModel_1.riderModel.findOne({ email: email.toLowerCase() });
        if (!rider)
            return res.status(404).json({ message: "User not found" });
        if (rider.isVerified) {
            return res.status(400).json({ message: "Email already verified" });
        }
        if (rider.otpLastSentAt &&
            Date.now() - rider.otpLastSentAt.getTime() < OTP_RESEND_COOLDOWN * 60000) {
            return res.status(429).json({
                message: "Please wait before requesting another OTP",
            });
        }
        const otp = (0, otp_1.generateOTP)();
        rider.emailOTP = await (0, hash_1.hashValue)(otp);
        rider.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000);
        rider.otpAttempts = 0;
        rider.otpLastSentAt = new Date();
        await rider.save();
        const html = (0, verifyEmail_1.verifyEmailOTPTemplate)({
            userName: rider.fullName,
            appName: APP_NAME,
            otpCode: otp,
            expiryTime: `${OTP_EXPIRY_MINUTES} minutes`,
            supportEmail: "support@elishaglobal.com",
            currentYear: new Date().getFullYear(),
        });
        await (0, emailService_1.sendEmail)({
            to: email.toLowerCase(),
            subject: "Your New OTP - Email Verification",
            html,
        });
        return res.status(200).json({ message: "New OTP sent successfully" });
    }
    catch (error) {
        console.error("Resend OTP error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
exports.resendOTP = resendOTP;
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    const rider = await ridersModel_1.riderModel.findOne({ email: email.toLowerCase() });
    if (!rider) {
        return res.status(404).json({ message: "User not found" });
    }
    if (!rider.isVerified) {
        return res.status(403).json({ message: "Email not verified. Please verify your email first." });
    }
    // Generate OTP
    const otp = (0, otp_1.generateOTP)();
    const hashedOTP = await (0, hash_1.hashValue)(otp);
    // Update rider with new OTP details
    rider.emailOTP = hashedOTP;
    rider.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    rider.otpAttempts = 0;
    rider.otpLastSentAt = new Date();
    await rider.save();
    // Send OTP email (reusing verifyEmailOTPTemplate for simplicity)
    const html = (0, verifyEmail_1.verifyEmailOTPTemplate)({
        userName: rider.fullName,
        appName: APP_NAME,
        otpCode: otp,
        expiryTime: `${OTP_EXPIRY_MINUTES} minutes`,
        supportEmail: "support@elishagloballogistics2025@gmail.com",
        currentYear: new Date().getFullYear(),
    });
    await (0, emailService_1.sendEmail)({
        to: email.toLowerCase(),
        subject: "Reset Your Password - OTP Code",
        html,
    });
    res.status(200).json({
        message: "Password reset OTP sent to your email.",
    });
};
exports.forgotPassword = forgotPassword;
const logout = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1]; // Extract token from Bearer header
        if (!token) {
            res.status(400).json({ message: "Token is required" });
            return;
        }
        // Decode token to get expiry date
        const decoded = jsonwebtoken_1.default.decode(token);
        if (!decoded || !decoded.exp) {
            res.status(400).json({ message: "Invalid token" });
            return;
        }
        const expiresAt = new Date(decoded.exp * 1000); // Convert to milliseconds
        // Add token to blacklist
        const blacklistedToken = new blacklistModel_1.blacklistModel({
            token,
            expiresAt,
        });
        await blacklistedToken.save();
        res.status(200).json({ message: "Logged out successfully" });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", err: err.message });
    }
};
exports.logout = logout;
//# sourceMappingURL=ridersContoller.js.map