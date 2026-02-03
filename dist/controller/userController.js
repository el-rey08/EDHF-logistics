"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.forgotPassword = exports.resendOTP = exports.verifyEmailOTP = exports.changePassword = exports.updateProfile = exports.getAllUser = exports.getOneUser = exports.login = exports.createUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = require("../models/userModel");
const blacklistModel_1 = require("../models/blacklistModel");
const otp_1 = require("../utils/otp");
const hash_1 = require("../utils/hash");
const emailService_1 = require("../emails/emailService");
const verifyEmail_1 = require("../emails/templates/verifyEmail");
const cloudinary_1 = __importDefault(require("../utils/cloudinary"));
const fs_1 = __importDefault(require("fs"));
const OTP_EXPIRY_MINUTES = 10;
const OTP_RESEND_COOLDOWN = 1; // minutes
const APP_NAME = "elisha global service LTD";
const MAX_OTP_ATTEMPTS = 5;
const createUser = async (req, res) => {
    try {
        const { fullName, email, password, confirmPassword, phoneNumber, address, } = req.body;
        // 🔍 Validate required fields
        if (!fullName ||
            !email ||
            !password ||
            !confirmPassword ||
            !phoneNumber ||
            !address) {
            res.status(400).json({ message: "All fields are required" });
            return;
        }
        if (password !== confirmPassword) {
            res.status(400).json({ message: "Passwords do not match" });
            return;
        }
        // 🔎 Check existing user
        const existingUser = await userModel_1.userModel.findOne({
            email: email.toLowerCase(),
        });
        if (existingUser) {
            res.status(400).json({ message: "Email already exists" });
            return;
        }
        // 🔐 Hash password
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        // 🔢 Generate OTP
        const otp = (0, otp_1.generateOTP)();
        const hashedOTP = await (0, hash_1.hashValue)(otp);
        // ☁️ Cloudinary Upload (optional image)
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
        // 👤 Create user
        const user = new userModel_1.userModel({
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
        res.status(201).json({
            message: "User created successfully. OTP sent to email.",
            data: user,
        });
    }
    catch (err) {
        res.status(500).json({
            message: "Server error",
            err: err.message,
        });
    }
};
exports.createUser = createUser;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel_1.userModel.findOne({ email: email.toLowerCase() });
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(400).json({ message: "Incorrect password" });
            return;
        }
        if (!user.isVerified) {
            res.status(403).json({ message: "Email not verified" });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: "1d" });
        res.status(200).json({
            message: "Login successful",
            token,
            data: user.fullName
        });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", err: err.message });
    }
};
exports.login = login;
const getOneUser = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userModel_1.userModel.findById(id);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json({ message: "User fetched successfully", data: user });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", err: err.message });
    }
};
exports.getOneUser = getOneUser;
const getAllUser = async (req, res) => {
    try {
        const getUsers = await userModel_1.userModel.find();
        if (!getUsers) {
            res.status(404).json({ message: "Users not found" });
            return;
        }
        res.status(200).json({ message: "Users fetched successfully", data: getUsers });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", err: err.message });
    }
};
exports.getAllUser = getAllUser;
const updateProfile = async (req, res) => {
    try {
        const { fullName, address, phoneNumber } = req.body;
        const updatedUser = await userModel_1.userModel.findByIdAndUpdate(req.user.userId, { fullName, address, phoneNumber }, { new: true });
        if (!updatedUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json({
            message: "Profile updated successfully",
            data: updatedUser
        });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", err: err.message });
    }
};
exports.updateProfile = updateProfile;
const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmPassword } = req.body;
        if (newPassword !== confirmPassword) {
            res.status(400).json({ message: "Passwords do not match" });
            return;
        }
        const user = await userModel_1.userModel.findById(req.user.userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const isMatch = await bcrypt_1.default.compare(oldPassword, user.password);
        if (!isMatch) {
            res.status(400).json({ message: "Old password incorrect" });
            return;
        }
        const hashed = await bcrypt_1.default.hash(newPassword, 10);
        user.password = hashed;
        await user.save();
        res.status(200).json({ message: "Password updated successfully" });
    }
    catch (err) {
        res.status(500).json({ message: "Server error", err: err.message });
    }
};
exports.changePassword = changePassword;
const verifyEmailOTP = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
    }
    const user = await userModel_1.userModel.findOne({ email });
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
    const isValid = await bcrypt_1.default.compare(otp, user.emailOTP);
    if (!isValid) {
        user.otpAttempts += 1;
        await user.save();
        return res.status(400).json({ message: "Invalid OTP" });
    }
    user.isVerified = true;
    user.emailOTP = undefined;
    user.otpExpiresAt = undefined;
    user.otpAttempts = 0;
    await user.save();
    const token = jsonwebtoken_1.default.sign({
        userId: user._id,
        email: user.email,
        role: user.role,
    }, process.env.JWT_SECRET, { expiresIn: "7d" });
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
exports.verifyEmailOTP = verifyEmailOTP;
const resendOTP = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    const existingUser = await userModel_1.userModel.findOne({ email });
    if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
    }
    if (existingUser.isVerified) {
        return res.status(400).json({ message: "Email already verified" });
    }
    if (existingUser.otpLastSentAt &&
        Date.now() - existingUser.otpLastSentAt.getTime() <
            OTP_RESEND_COOLDOWN * 60000) {
        return res.status(429).json({
            message: "Please wait before requesting another OTP",
        });
    }
    const otp = (0, otp_1.generateOTP)();
    existingUser.emailOTP = await (0, hash_1.hashValue)(otp);
    existingUser.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60000);
    existingUser.otpAttempts = 0;
    existingUser.otpLastSentAt = new Date();
    await existingUser.save();
    const html = (0, verifyEmail_1.verifyEmailOTPTemplate)({
        userName: existingUser.fullName,
        appName: APP_NAME,
        otpCode: otp,
        expiryTime: `${OTP_EXPIRY_MINUTES} minutes`,
        supportEmail: "support@elishaglobal.com",
        currentYear: new Date().getFullYear(),
    });
    await (0, emailService_1.sendEmail)({
        to: email,
        subject: "Your New OTP - Email Verification",
        html,
    });
    res.status(200).json({
        message: "New OTP sent successfully",
    });
};
exports.resendOTP = resendOTP;
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    const user = await userModel_1.userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
    if (!user.isVerified) {
        return res.status(403).json({ message: "Email not verified. Please verify your email first." });
    }
    // Generate OTP
    const otp = (0, otp_1.generateOTP)();
    const hashedOTP = await (0, hash_1.hashValue)(otp);
    // Update user with new OTP details
    user.emailOTP = hashedOTP;
    user.otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);
    user.otpAttempts = 0;
    user.otpLastSentAt = new Date();
    await user.save();
    // Send OTP email (reusing verifyEmailOTPTemplate for simplicity)
    const html = (0, verifyEmail_1.verifyEmailOTPTemplate)({
        userName: user.fullName,
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
//# sourceMappingURL=userController.js.map