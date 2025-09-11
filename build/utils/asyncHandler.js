"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = void 0;
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((err) => {
            console.error("Controller Error:", err);
            res.status(500).json({
                success: false,
                message: err.message || "Internal Server Error",
            });
        });
    };
};
exports.asyncHandler = asyncHandler;
