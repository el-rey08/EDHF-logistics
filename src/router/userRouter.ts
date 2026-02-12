import express, { Router } from "express";
import {
    createUser,
    login,
    getOneUser,
    getAllUser,
    updateProfile,
    changePassword,
    verifyEmailOTP,
    resendOTP,
    forgotPassword,
    logout,
    getAvailableRiders
} from "../controller/userController";
import { authenticate } from "../middleware/auth";
import { upload } from "../utils/multer";

export const userRoutes: Router = express.Router();

/**
 * @swagger
 * /api/users/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *               - confirmPassword
 *               - phoneNumber
 *               - address
 *             properties:
 *               fullName:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               address:
 *                 type: string
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: Optional profile image file
 *     responses:
 *       201:
 *         description: User created successfully, OTP sent to email
 *       400:
 *         description: Bad request
 */
userRoutes.post("/signup", upload.single("profileImage"), createUser);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Authenticate a user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 data:
 *                   type: string
 *       404:
 *         description: User not found
 *       400:
 *         description: Incorrect password
 *       403:
 *         description: Email not verified
 */
userRoutes.post("/login", login);

/**
 * @swagger
 * /api/users/get-one/{id}:
 *   get:
 *     summary: Get details of a specific user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User fetched successfully
 *       404:
 *         description: User not found
 */
userRoutes.get("/get-one/:id", authenticate, getOneUser);

/**
 * @swagger
 * /api/users/getall:
 *   get:
 *     summary: Get list of all users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: Users not found
 */
userRoutes.get("/getall", getAllUser);

/**
 * @swagger
 * /api/users/update-profile:
 *   patch:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               address:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       404:
 *         description: User not found
 */
userRoutes.patch("/update-profile", authenticate, updateProfile);

/**
 * @swagger
 * /api/users/change-password:
 *   patch:
 *     summary: Change user password
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *               confirmPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password updated successfully
 *       400:
 *         description: Bad request
 */
userRoutes.patch("/change-password", authenticate, changePassword);

/**
 * @swagger
 * /api/users/verify-email:
 *   post:
 *     summary: Verify email with OTP
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: Account verified successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: User not found
 */
userRoutes.post("/verify-email", verifyEmailOTP);

/**
 * @swagger
 * /api/users/resend-otp:
 *   post:
 *     summary: Resend OTP for email verification
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: New OTP sent successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: User not found
 */
userRoutes.post("/resend-otp", resendOTP);

/**
 * @swagger
 * /api/users/forgot-password:
 *   post:
 *     summary: Initiate password reset
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset OTP sent to email
 *       404:
 *         description: User not found
 *       403:
 *         description: Email not verified
 */
userRoutes.post("/forgot-password", forgotPassword);

/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
userRoutes.post("/logout", authenticate, logout);

/**
 * @swagger
 * /api/users/available-riders:
 *   get:
 *     summary: Get list of available riders
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Available riders fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 riders:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Internal server error
 */
userRoutes.get("/available-riders", authenticate, getAvailableRiders);

