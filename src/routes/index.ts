import { Router } from "express";
import authRoutes from "../routes/auth/auth.routes"
import serverRoutes from "../routes/server/main"
const router = Router(); 

router.use("/server", serverRoutes)
router.use("/auth", authRoutes);
router.use("/health", authRoutes);

export default router;