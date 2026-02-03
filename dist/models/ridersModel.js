"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.riderModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// -------------------- SCHEMA --------------------
const RiderSchema = new mongoose_1.Schema({
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
}, { timestamps: true });
// -------------------- HIDE PASSWORD ----------------
RiderSchema.methods.toJSON = function () {
    const rider = this.toObject();
    delete rider.password;
    return rider;
};
exports.riderModel = mongoose_1.default.model("Rider", RiderSchema);
//# sourceMappingURL=ridersModel.js.map