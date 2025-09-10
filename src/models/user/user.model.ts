import mongoose, { Document } from "mongoose";
import { UserSchema } from "../../schemas/user.schema";
export interface IUser extends Document {
    email: string;
    username: string;
    password: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export const UserModel = mongoose.model<IUser>("User", UserSchema);
