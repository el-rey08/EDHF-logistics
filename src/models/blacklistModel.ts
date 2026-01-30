import mongoose, { Schema, Document } from "mongoose";

export interface IBlacklist extends Document {
  token: string;
  expiresAt: Date;
}

const blacklistSchema = new Schema<IBlacklist>(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// Index to auto-delete expired tokens
blacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const blacklistModel = mongoose.model<IBlacklist>("blacklist", blacklistSchema);
