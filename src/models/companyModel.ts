import mongoose, { Document, mongo, Schema } from "mongoose";
export interface company extends Document {
    companyName: string,
    companyEmail: string,
    companyAddress: string,
    companyPhone: string,
    companyPassword: string,
    role: "admin",
    companyProfile?: string,
    emailOTP?: string | null,
    otpExpiresAt?: Date | null,
    otpAttempts: number,
    otpLastSentAt?: Date | null,
    isVerified: boolean,
    createdAt: Date,
    updatedAt: Date,
}
const companySchema = new Schema<company>({
    companyName: {
        type: String,
        required: true,
        trim: true
    },
    companyAddress: {
        type: String,
        required: true,
        trim: true,
    },
    companyEmail: {
        type: String,
        required: true,
        lowercase: true,
        unique: true,
        trim: true,
    },
    companyPhone: {
        type: String,
        required: true,
    },
    companyProfile: {
        type: String
    },
    companyPassword: {
        type: String,
        required: true
    },
    emailOTP: {
        type: String,
        select: false,
        default: null
    },
    otpExpiresAt: {
        type: Date,
        default: null
    },
    otpAttempts: {
        type: Number,
        default: 0
    },
    otpLastSentAt: {
        type: Date,
        default: null
    },
    isVerified: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
})

export const companyModel = mongoose.model<company>("elisha", companySchema)
