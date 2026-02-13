import express, { Router } from "express";
import { createDelivery, getUserDeliveries, getDeliveryById } from "../controller/deliveryController";
// Import auth middleware (will check exact name next, assuming auth for now but might need fix)
import { authenticate } from "../middleware/auth";

export const deliveryRoutes: Router = express.Router();

/**
 * @swagger
 * /api/deliveries/user:
 *   get:
 *     summary: Get all deliveries for the logged-in user
 *     tags: [Deliveries]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of deliveries
 */
deliveryRoutes.get("/user", authenticate, getUserDeliveries);

/**
 * @swagger
 * /api/deliveries/{id}:
 *   get:
 *     summary: Get a specific delivery by ID
 *     tags: [Deliveries]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Delivery details
 *       404:
 *         description: Delivery not found
 */
deliveryRoutes.get("/:id", getDeliveryById);

/**
 * @swagger
 * /api/deliveries:
 *   post:
 *     summary: Create a new delivery request
 *     tags: [Deliveries]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sender
 *               - receiver
 *             properties:
 *               sender:
 *                 type: object
 *                 required:
 *                   - fullName
 *                   - phoneNumber
 *                   - email
 *                   - pickupLocation
 *                 properties:
 *                   fullName:
 *                     type: string
 *                   phoneNumber:
 *                     type: string
 *                   email:
 *                     type: string
 *                   pickupLocation:
 *                     type: string
 *                   address:
 *                     type: string
 *                   pickupDate:
 *                     type: string
 *                   packageDescription:
 *                     type: string
 *                   pickupInstructions:
 *                     type: string
 *               receiver:
 *                 type: object
 *                 required:
 *                   - fullName
 *                   - phoneNumber
 *                   - email
 *                   - deliveryLocation
 *                 properties:
 *                   fullName:
 *                     type: string
 *                   phoneNumber:
 *                     type: string
 *                   phoneNumber2:
 *                     type: string
 *                   email:
 *                     type: string
 *                   deliveryLocation:
 *                     type: string
 *                   address:
 *                     type: string
 *               userId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Delivery created successfully
 *       400:
 *         description: Validation error
 */
deliveryRoutes.post("/", createDelivery);
