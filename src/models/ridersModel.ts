import mongoose, { Document, Schema } from "mongoose";

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

  approvedBy?: mongoose.Types.ObjectId | null; // Reference to the approving company

  // OTP related
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
    coordinates: [number, number]; // [lng, lat]
  };

  createdAt: Date;
  updatedAt: Date;
}

// -------------------- SCHEMA --------------------
const RiderSchema = new Schema<IRider>(
  {
    fullName: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, unique: true },
    email: { type: String, lowercase: true, unique: true, sparse: true },
    password: { type: String, required: true, select: false },

    role: { type: String, enum: ["rider"], default: "rider" },

    profileImage: { type: String },

    governmentIdType: {
      type: String,
      enum: ["NIN", "DRIVERS_LICENSE", "PASSPORT"],
      required: true,
    },
    governmentIdNumber: { type: String, required: true, unique: true },
    idDocument: { type: String },

    vehicle: {
      type: {
        type: String,
        enum: ["bike", "car", "van", "truck"],
        required: true,
      },
      plateNumber: { type: String, required: true, unique: true },
      color: { type: String },
      image: { type: String },
    },

    status: {
      type: String,
      enum: ["pending", "approved", "suspended"],
      default: "pending",
    },
    isAvailable: { type: Boolean, default: false },
    approvedBy: { type: Schema.Types.ObjectId, ref: "Company", default: null },

    // ---------------- OTP FIELDS ----------------
    emailOTP: { type: String, select: false, default: null },
    otpExpiresAt: { type: Date, default: null },
    otpAttempts: { type: Number, default: 0 },
    otpLastSentAt: { type: Date, default: null },
    isVerified: { type: Boolean, default: false },

    // ---------------- OTHER ----------------
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalDeliveries: { type: Number, default: 0 },
    walletBalance: { type: Number, default: 0 },

    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        index: "2dsphere",
      },
    },
  },
  { timestamps: true }
);

// -------------------- HIDE PASSWORD ----------------
RiderSchema.methods.toJSON = function () {
  const rider = this.toObject();
  delete rider.password;
  return rider;
};

export const riderModel = mongoose.model<IRider>("Rider", RiderSchema);
