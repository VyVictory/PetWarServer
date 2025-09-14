"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_routes_1 = __importDefault(require("../routes/auth/auth.routes"));
const main_1 = __importDefault(require("../routes/server/main"));
const router = (0, express_1.Router)();
router.use("/server", main_1.default);
router.use("/auth", auth_routes_1.default);
router.use("/health", auth_routes_1.default);
exports.default = router;
