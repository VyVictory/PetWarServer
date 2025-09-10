import { Router } from "express";
import * as AuthController from "../../controllers/auth/auth.controller";
import { asyncHandler } from "../../utils/asyncHandler";

const router = Router();

router.post("/login", asyncHandler(AuthController.login));
router.post("/register", asyncHandler(AuthController.register));

export default router;
