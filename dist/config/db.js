"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDb = void 0;
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const connectDb = async () => {
    const DB = process.env.DATABASE_URL;
    if (!DB)
        throw new Error("DATABASE_URL missing");
    await mongoose_1.default.connect(DB);
    console.log("MongoDB connected");
};
exports.connectDb = connectDb;
//# sourceMappingURL=db.js.map