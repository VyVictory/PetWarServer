import { Schema } from "mongoose";

export const UserSchema = new Schema({
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
}, {
    timestamps: true // tự động thêm createdAt, updatedAt
});
