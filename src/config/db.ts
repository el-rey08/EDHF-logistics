import "dotenv/config"
import mongoose from "mongoose"

export const connectDb = async (): Promise<void> => {
  const MONGODB_URL = process.env.DATABASE_URL

  if (!MONGODB_URL) {
    throw new Error("Missing DATABASE_URL in env");
  }

  try {
    await mongoose.connect(MONGODB_URL);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("DB connection error", err);
    throw err;
  }
};
