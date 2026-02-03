import mongoose, { Document } from "mongoose";
export interface IRider extends Document {
    fullName: string;
    phoneNumber: string;
    email?: string;
    password: string;
    role: "rider";
    profileImage?: string;
    governmentIdType: "NIN" | "DRIVERS_LICENSE" | "PASSPORT";
    governmentIdNumber: string;
    idDocument?: string;
    vehicle: {
        type: "bike" | "car" | "van" | "truck";
        plateNumber: string;
        color?: string;
        image?: string;
    };
    status: "pending" | "approved" | "suspended";
    isAvailable: boolean;
    emailOTP?: string | null;
    otpExpiresAt?: Date | null;
    otpAttempts: number;
    otpLastSentAt?: Date | null;
    isVerified: boolean;
    rating: number;
    totalDeliveries: number;
    walletBalance: number;
    currentLocation?: {
        type: "Point";
        coordinates: [number, number];
    };
    createdAt: Date;
    updatedAt: Date;
}
export declare const riderModel: mongoose.Model<IRider, {}, {}, {}, mongoose.Document<unknown, {}, IRider, {}, mongoose.DefaultSchemaOptions> & IRider & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IRider>;
