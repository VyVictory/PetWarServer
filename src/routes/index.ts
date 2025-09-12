import { Router } from "express";
import authRoutes from "../routes/auth/auth.routes"
const router = Router(); 

router.use("/auth", authRoutes);
router.use("/health", authRoutes);

export default router;