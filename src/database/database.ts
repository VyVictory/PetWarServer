import mongoose from "mongoose";
import { CONFIG } from "../config";

export const connectDB = async () => {
  try {
    await mongoose.connect(CONFIG.MONGO_URI, {
      dbName: CONFIG.DB_NAME,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};
