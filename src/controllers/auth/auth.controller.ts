import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { CONFIG } from "../../config";
import { UserModel } from "../../models/user/user.model";

export const login = async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const user = await UserModel.findOne({
            $or: [{ username }, { email: username }]
        }).lean();

        if (!user) {
            return res.status(200).json({ success: false, messageKey: "login.user_not_found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(200).json({ success: false, messageKey: "login.invalid_password" });
        }

        const token = jwt.sign({ id: user._id, username: user.username }, CONFIG.JWT_SECRET, { expiresIn: "1h" });

        return res.status(200).json({ success: true, messageKey: "login.success", token });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, messageKey: "error.server_error" });
    }
};

export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;

        const user = await UserModel.findOne({ $or: [{ email }, { username }] }).lean();
        if (user) return res.status(200).json({ success: false, messageKey: "register.already" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await new UserModel({ email, username, password: hashedPassword }).save();

        const token = jwt.sign({ id: newUser._id, username: newUser.username }, CONFIG.JWT_SECRET, { expiresIn: "1d" });

        return res.status(201).json({ success: true, messageKey: "register.success", token });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, messageKey: "error.server_error" });
    }
};
