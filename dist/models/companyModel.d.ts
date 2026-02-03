import mongoose, { Document } from "mongoose";
export interface company extends Document {
    companyName: String;
    companyEmail: String;
    companyAddress: String;
    companyPhone: String;
    companyPassword: String;
    role: "admin";
    companyProfile?: String;
    emailOTP?: string | null;
    otpExpiresAt?: Date | null;
    otpAttempts: number;
    otpLastSentAt?: Date | null;
    isVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const companyModel: mongoose.Model<company, {}, {}, {}, mongoose.Document<unknown, {}, company, {}, mongoose.DefaultSchemaOptions> & company & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, company>;
