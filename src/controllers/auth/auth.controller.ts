import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { CONFIG } from "../../config";
import { UserModel } from "../../models/user/user.model";
export const login = async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const user = await UserModel.findOne({
        $or: [{ username }, { email: username }]
    });



    if (!user) {
        return res.status(200).json({
            success: false,
            message: req.__("login.user_not_found")
        });
    }
    // So sánh password với bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(200).json({
            success: false,
            message: req.__("login.invalid_password")
        });
    }
    // Tạo JWT
    const token = jwt.sign(
        { id: user._id, username: user.username, email: user.email },
        CONFIG.JWT_SECRET,
        { expiresIn: "1h" }
    );
    return res.status(200).json({ success: true, message: req.__("login.success"), token: token });
};
export const register = async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    const user = await UserModel.findOne({
        $or: [{ email }, { username }]
    });
    if (user) {
        return res.status(200).json({
            success: false,
            message: req.__("register.already")
        })
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new UserModel({ email, username, password: hashedPassword });
    await newUser.save();
    if (!newUser._id) {
        return res.status(200).json({
            success: false,
            message: req.__("register.fail")
        })
    }
    const token = jwt.sign(
        { id: newUser._id, email: newUser.email },
        CONFIG.JWT_SECRET,
        { expiresIn: "1d" }
    );
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
