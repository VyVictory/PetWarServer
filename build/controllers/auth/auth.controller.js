"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = exports.login = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../../config");
const user_model_1 = require("../../models/user/user.model");
const login = async (req, res) => {
    const { username, password } = req.body;
    const user = await user_model_1.UserModel.findOne({
        $or: [{ username }, { email: username }]
    });
    if (!user) {
        return res.status(200).json({
            success: false,
            message: req.__("login.user_not_found")
        });
    }
    // So sánh password với bcrypt
    const isMatch = await bcrypt_1.default.compare(password, user.password);
    if (!isMatch) {
        return res.status(200).json({
            success: false,
            message: req.__("login.invalid_password")
        });
    }
    // Tạo JWT
    const token = jsonwebtoken_1.default.sign({ id: user._id, username: user.username, email: user.email }, config_1.CONFIG.JWT_SECRET, { expiresIn: "1h" });
    return res.status(200).json({ success: true, message: req.__("login.success"), token: token });
};
exports.login = login;
const register = async (req, res) => {
    const { username, email, password } = req.body;
    const user = await user_model_1.UserModel.findOne({
        $or: [{ email }, { username }]
    });
    if (user) {
        return res.status(200).json({
            success: false,
            message: req.__("register.already")
        });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
    const newUser = new user_model_1.UserModel({ email, username, password: hashedPassword });
    await newUser.save();
    if (!newUser._id) {
        return res.status(200).json({
            success: false,
            message: req.__("register.fail")
        });
    }
    const token = jsonwebtoken_1.default.sign({ id: newUser._id, email: newUser.email }, config_1.CONFIG.JWT_SECRET, { expiresIn: "1d" });
    return res.status(201).json({
        success: true, message: req.__("register.success"),
        // data: {
        //     id: user._id,
        //     username: user.username,
        //     email: user.email,
        //     createdAt: user.createdAt
        // },
        token
    });
};
exports.register = register;
