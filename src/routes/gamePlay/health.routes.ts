import { Router } from "express";
import * as AuthController from "../../controllers/auth/auth.controller";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.get("/", (req, res) => {
    res.send("Hello from Express API!");
});
router.get("/join", (req, res) => {
    res.json({ status: "ok" });
});

export default router;
