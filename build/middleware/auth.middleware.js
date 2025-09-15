"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers["authorization"]?.split(" ")[1];
        if (!token)
            return res.status(401).json({ error: "No token provided" });
        try {
            const decoded = jsonwebtoken_1.default.verify(token, config_1.CONFIG.JWT_SECRET);
            req.user = decoded;
            next();
        }
        catch {
            return res.status(403).json({ error: "Invalid token" });
        }
    }
    catch (error) {
        return res.status(403).json({ error: "Error this auth.middleware.ts" });
    }
};
exports.authMiddleware = authMiddleware;
