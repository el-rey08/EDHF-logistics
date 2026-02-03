import mongoose, { Document } from "mongoose";
export interface IBlacklist extends Document {
    token: string;
    expiresAt: Date;
}
export declare const blacklistModel: mongoose.Model<IBlacklist, {}, {}, {}, mongoose.Document<unknown, {}, IBlacklist, {}, mongoose.DefaultSchemaOptions> & IBlacklist & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IBlacklist>;
