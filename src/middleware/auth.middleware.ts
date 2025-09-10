import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { CONFIG } from "../config";
export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.headers["authorization"]?.split(" ")[1];
        if (!token) return res.status(401).json({ error: "No token provided" });
        try {
            const decoded = jwt.verify(token, CONFIG.JWT_SECRET);
            (req as any).user = decoded;
            next();
        } catch {
            return res.status(403).json({ error: "Invalid token" });
        }
    } catch (error) {
        return res.status(403).json({ error: "Error this auth.middleware.ts" });
    }
}