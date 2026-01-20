"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDb = void 0;
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const connectDb = async () => {
    const MONGODB_URL = process.env.DATABASE_URL;
    if (!MONGODB_URL) {
        throw new Error("Missing DATABASE_URL in env");
    }
    try {
        await mongoose_1.default.connect(MONGODB_URL);
        console.log("MongoDB connected");
    }
    catch (err) {
        console.error("DB connection error", err);
        throw err;
    }
};
exports.connectDb = connectDb;
//# sourceMappingURL=db.js.map