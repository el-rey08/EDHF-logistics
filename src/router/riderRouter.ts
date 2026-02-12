import express, { Router } from "express";
import { riderSignup, verifyEmailOTP, resendOTP, updateLocation } from "../controller/ridersContoller";
import { validateRider } from "../middleware/ridersVlidation";
import { authenticate } from "../middleware/auth";
export const riderRoutes: Router = express.Router();

/**
 * @swagger
 * /api/riders/signup:
 *   post:
 *     summary: Register a new rider
 *     tags: [Riders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - password
 *               - confirmPassword
 *               - phoneNumber
 *               - vehicle
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
 *               vehicle:
 *                 type: string
 *     responses:
 *       201:
 *         description: Rider created successfully
 *       400:
 *         description: Bad request
 */
riderRoutes.post("/signup", validateRider, riderSignup);

/**
 * @swagger
 * /api/riders/verify-email:
 *   post:
 *     summary: Verify rider email with OTP
 *     tags: [Riders]
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
 *         description: Rider not found
 */
riderRoutes.post("/verify-email", verifyEmailOTP);

/**
 * @swagger
 * /api/riders/resend-otp:
 *   post:
 *     summary: Resend OTP for rider email verification
 *     tags: [Riders]
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
 *         description: Rider not found
 */
riderRoutes.post("/resend-otp", resendOTP);

/**
 * @swagger
 * /api/riders/location:
 *   put:
 *     summary: Update rider's location
 *     tags: [Riders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lat
 *               - lng
 *             properties:
 *               lat:
 *                 type: number
 *               lng:
 *                 type: number
 *     responses:
 *       200:
 *         description: Location updated successfully
 */
riderRoutes.put("/location", authenticate, updateLocation);
