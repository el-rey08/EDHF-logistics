import mongoose, { Schema, Document } from "mongoose";

export const LAGOS_LGAS = [
    "Agege",
    "Ajeromi-Ifelodun",
    "Alimosho",
    "Amuwo-Odofin",
    "Apapa",
    "Badagry",
    "Epe",
    "Eti-Osa",
    "Ibeju-Lekki",
    "Ifako-Ijaiye",
    "Ikeja",
    "Ikorodu",
    "Kosofe",
    "Lagos Island",
    "Lagos Mainland",
    "Mushin",
    "Ojo",
    "Oshodi-Isolo",
    "Shomolu",
    "Surulere",
];

export interface IDelivery extends Document {
    sender: {
        fullName: string;
        phoneNumber: string;
        email?: string;
        pickupLocation: string;
        address: string; // "Specific Address"
        pickupDate: string;
        packageDescription: string;
        pickupInstructions?: string;
    };
    receiver: {
        fullName: string;
        phoneNumber: string;
        phoneNumber2?: string;
        email: string;
        deliveryLocation: string;
        address?: string;
    };
    price: number;
    status: "pending" | "assigned" | "picked_up" | "delivered" | "cancelled";
    deliveryType: "express" | "standard";
    riderId?: mongoose.Types.ObjectId;
    userId?: mongoose.Types.ObjectId;
    trackingId: string;
    createdAt: Date;
    updatedAt: Date;
}

const DeliverySchema = new Schema<IDelivery>(
    {
        sender: {
            fullName: { type: String, required: true, trim: true },
            phoneNumber: { type: String, required: true },
            email: { type: String, lowercase: true, trim: true },
            pickupLocation: { type: String, required: true, enum: LAGOS_LGAS },
            address: { type: String, required: true }, // Specific Address
            pickupDate: { type: String, required: true },
            packageDescription: { type: String, required: true },
            pickupInstructions: { type: String },
        },
        receiver: {
            fullName: { type: String, required: true, trim: true },
            phoneNumber: { type: String, required: true },
            phoneNumber2: { type: String },
            email: { type: String, required: true, lowercase: true, trim: true },
            deliveryLocation: { type: String, required: true, enum: LAGOS_LGAS },
            address: { type: String },
        },
        price: { type: Number, required: true },
        status: {
            type: String,
            enum: ["pending", "assigned", "picked_up", "delivered", "cancelled"],
            default: "pending",
        },
        deliveryType: {
            type: String,
            enum: ["express", "standard"],
            default: "express",
        },
        riderId: { type: Schema.Types.ObjectId, ref: "Rider" },
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        trackingId: { type: String, unique: true, required: true },
    },
    { timestamps: true }
);

export const deliveryModel = mongoose.model<IDelivery>("Delivery", DeliverySchema);
