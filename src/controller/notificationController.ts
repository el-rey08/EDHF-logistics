import { Request, Response } from "express";
import { notificationModel } from "../models/notificationModel";

// Get all notifications for a user
export const getUserNotifications = async (req: any, res: Response) => {
    try {
        const userId = req.user.userId;
        const notifications = await notificationModel
            .find({ userId })
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: "Notifications fetched successfully",
            data: notifications,
        });
    } catch (error: any) {
        console.error("Get notifications error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Mark a notification as read
export const markNotificationRead = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const notification = await notificationModel.findByIdAndUpdate(
            id,
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.status(200).json({
            message: "Notification marked as read",
            data: notification,
        });
    } catch (error: any) {
        console.error("Mark notification read error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// Internal helper to create notification (can be called from other controllers)
export const createNotification = async (
    userId: string,
    title: string,
    message: string,
    type: "info" | "success" | "warning" | "error" = "info",
    relatedId?: string
) => {
    try {
        const notification = new notificationModel({
            userId,
            title,
            message,
            type,
            relatedId,
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.error("Failed to create notification:", error);
    }
};
