import mongoose, { Document } from "mongoose";
export interface IUser extends Document {
    fullName: string;
    email: string;
    password: string;
    address: string;
    phoneNumber: string;
    isVerified: boolean;
    emailOTP?: string;
    otpExpiresAt?: Date;
    otpAttempts: number;
    otpLastSentAt?: Date;
}
export declare const userModel: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
