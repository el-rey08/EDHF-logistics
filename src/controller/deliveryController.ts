import { Request, Response } from "express";
import { deliveryModel, LAGOS_LGAS } from "../models/deliveryModel";
import { generateOTP } from "../utils/otp"; // Reusing for tracking ID if suitable, or generate new

// Regex Patterns
const NAME_REGEX = /^[a-zA-Z\s]{2,}$/;
const PHONE_REGEX = /^(?:\+234|0)[789]\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LGA_PRICE_LIST: Record<string, number> = {
    "Agege": 2000,
    "Ajeromi-Ifelodun": 2500,
    "Alimosho": 3000,
    "Amuwo-Odofin": 2500,
    "Apapa": 3000,
    "Badagry": 5000,
    "Epe": 4500,
    "Eti-Osa": 3500,
    "Ibeju-Lekki": 4000,
    "Ifako-Ijaiye": 2500,
    "Ikeja": 2000,
    "Ikorodu": 3500,
    "Kosofe": 2500,
    "Lagos Island": 3000,
    "Lagos Mainland": 2500,
    "Mushin": 2000,
    "Ojo": 3500,
    "Oshodi-Isolo": 2500,
    "Shomolu": 2500,
    "Surulere": 2500,
};

const generateDailyTrackingId = async () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const datePrefix = `${year}${month}${day}`;

    // Find the last deliveryCreated today
    const lastDelivery = await deliveryModel
        .findOne({ trackingId: new RegExp(`^${datePrefix}-`) })
        .sort({ createdAt: -1 });

    let sequence = 1;
    if (lastDelivery && lastDelivery.trackingId) {
        const lastSequence = parseInt(lastDelivery.trackingId.split("-")[1], 10);
        sequence = lastSequence + 1;
    }

    return `${datePrefix}-${String(sequence).padStart(3, "0")}`;
};

export const createDelivery = async (req: Request, res: Response) => {
    try {
        const { sender, receiver, userId } = req.body;

        // 1. Validation
        const validateContact = (data: any, type: "Sender" | "Receiver") => {
            if (!NAME_REGEX.test(data.fullName)) {
                return `${type} Full Name must be at least 2 characters and contain only letters/spaces.`;
            }
            if (!PHONE_REGEX.test(data.phoneNumber)) {
                return `${type} Phone Number must be a valid Nigerian number.`;
            }
            if (data.email && !EMAIL_REGEX.test(data.email)) {
                return `${type} Email is invalid.`;
            }
            if (type === "Sender") {
                if (!data.pickupDate) return "Pickup Date is required.";
                if (!data.packageDescription) return "Package Description is required.";
                if (!data.address) return "Specific Address is required.";
            }
            return null;
        };

        const senderError = validateContact(sender, "Sender");
        if (senderError) return res.status(400).json({ message: senderError });

        const receiverError = validateContact(receiver, "Receiver");
        if (receiverError) return res.status(400).json({ message: receiverError });

        if (receiver.phoneNumber2 && !PHONE_REGEX.test(receiver.phoneNumber2)) {
            return res.status(400).json({ message: "Receiver Phone Number 2 must be valid." });
        }

        if (!LAGOS_LGAS.includes(sender.pickupLocation)) {
            return res.status(400).json({ message: "Invalid Sender Pickup Location." });
        }
        if (!LAGOS_LGAS.includes(receiver.deliveryLocation)) {
            return res.status(400).json({ message: "Invalid Receiver Delivery Location." });
        }

        // 2. Pricing and Delivery Type Logic
        let price = LGA_PRICE_LIST[sender.pickupLocation] || 2500;
        let deliveryType = "express";

        // Parse pickupDate (assuming DD/MM/YYYY or similar string format, but for robust parsing, we might need a library or explicit split)
        // Trying to handle "DD/MM/YYYY" or "YYYY-MM-DD"
        // If regex matches DD/MM/YYYY
        let dateObj = new Date();
        const dateParts = sender.pickupDate.split("/");
        if (dateParts.length === 3) {
            // DD/MM/YYYY -> MM/DD/YYYY for JS Date constructor
            dateObj = new Date(`${dateParts[1]}/${dateParts[0]}/${dateParts[2]}`);
        } else {
            dateObj = new Date(sender.pickupDate);
        }

        const day = dateObj.getDay(); // 0 = Sunday, 6 = Saturday
        if (day === 0 || day === 6) {
            deliveryType = "standard";
            price = price * 1.5; // 50% surcharge
        }

        // 3. Generate Tracking ID
        const trackingId = await generateDailyTrackingId();

        // 4. Create Delivery
        const newDelivery = new deliveryModel({
            sender,
            receiver,
            userId: userId || null, // Optional if user is logged in
            price,
            trackingId,
            deliveryType,
        });

        await newDelivery.save();

        // 5. Notify Admin if Standard Delivery
        if (deliveryType === "standard") {
            // Import sendEmail dynamically or ensure it's imported at top
            const { sendEmail } = require("../emails/emailService");

            await sendEmail({
                to: process.env.ADMIN_EMAIL || "admin@example.com", // Fallback
                subject: "New Standard Delivery Request (Weekend)",
                html: `<p>A new Standard delivery request has been made for the weekend.</p>
                        <p><strong>Tracking ID:</strong> ${trackingId}</p>
                        <p><strong>Pickup Date:</strong> ${sender.pickupDate}</p>
                        <p>Please assign a rider manually.</p>`
            });
        }

        return res.status(201).json({
            message: "Delivery request created successfully",
            data: {
                trackingId: newDelivery.trackingId,
                price: newDelivery.price,
                status: newDelivery.status,
                deliveryType: newDelivery.deliveryType,
                deliveryId: newDelivery._id
            },
        });

    } catch (error: any) {
        console.error("Create Delivery Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getUserDeliveries = async (req: any, res: Response) => {
    try {
        const userId = req.user.userId; // user attached by auth middleware
        const deliveries = await deliveryModel.find({ userId }).sort({ createdAt: -1 });

        return res.status(200).json({
            message: "User deliveries fetched successfully",
            data: deliveries,
        });
    } catch (error: any) {
        console.error("Get User Deliveries Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getDeliveryById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const delivery = await deliveryModel.findById(id).populate("riderId", "fullName phoneNumber vehicle");

        if (!delivery) {
            return res.status(404).json({ message: "Delivery not found" });
        }

        return res.status(200).json({
            message: "Delivery fetched successfully",
            data: delivery,
        });
    } catch (error: any) {
        console.error("Get Delivery By ID Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
