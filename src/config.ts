import dotenv from "dotenv";
dotenv.config(); 
export const CONFIG = {
    PORT: process.env.PORT ? Number(process.env.PORT) : 443,
    JWT_SECRET: process.env.JWT_SECRET || "a96cbf028870c29249f83fbe0d75667df9398e03",
    MONGO_URI: process.env.MONGO_URI || "mongodb://127.0.0.1:27017",
    DB_NAME: process.env.DB_NAME || "petwar_db",
}