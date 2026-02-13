import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
    userId: mongoose.Types.ObjectId;
    title: string;
    message: string;
    type: "info" | "success" | "warning" | "error";
    isRead: boolean;
    relatedId?: string; // e.g. deliveryId or riderId
    createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        title: { type: String, required: true },
        message: { type: String, required: true },
        type: {
            type: String,
            enum: ["info", "success", "warning", "error"],
            default: "info",
        },
        isRead: { type: Boolean, default: false },
        relatedId: { type: String },
    },
    { timestamps: true }
);

export const notificationModel = mongoose.model<INotification>(
    "Notification",
    NotificationSchema
);
