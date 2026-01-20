import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  fullName: string;
  email: string;
  password: string;
  address: string;
  phoneNumber: string;
  isVerified: boolean;
}

const userSchema = new Schema<IUser>({
  fullName: { type: String, required: true, trim: true },

  email: { type: String, required: true, lowercase: true, unique: true, trim: true },

  password: { type: String, required: true, minlength: 8 },

  address: { type: String, required: true, trim: true },

  phoneNumber: { type: String, required: true },

  isVerified: { type: Boolean, default: false }

}, { timestamps: true });

export const userModel = mongoose.model<IUser>("users", userSchema);
