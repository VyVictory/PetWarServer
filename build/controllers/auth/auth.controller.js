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
    try {
        const { username, password } = req.body;
        const user = await user_model_1.UserModel.findOne({
            $or: [{ username }, { email: username }]
        }).lean();
        if (!user) {
            return res.status(200).json({ success: false, messageKey: "login.user_not_found" });
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(200).json({ success: false, messageKey: "login.invalid_password" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user._id, username: user.username }, config_1.CONFIG.JWT_SECRET, { expiresIn: "1h" });
        return res.status(200).json({ success: true, messageKey: "login.success", token });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, messageKey: "error.server_error" });
    }
};
exports.login = login;
const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = await user_model_1.UserModel.findOne({ $or: [{ email }, { username }] }).lean();
        if (user)
            return res.status(200).json({ success: false, messageKey: "register.already" });
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const newUser = await new user_model_1.UserModel({ email, username, password: hashedPassword }).save();
        const token = jsonwebtoken_1.default.sign({ id: newUser._id, username: newUser.username }, config_1.CONFIG.JWT_SECRET, { expiresIn: "1d" });
        return res.status(201).json({ success: true, messageKey: "register.success", token });
    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, messageKey: "error.server_error" });
    }
};
exports.register = register;
