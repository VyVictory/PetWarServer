import { Router } from "express";

const router = Router();

// Ping test
router.get("/ping", (_req, res) => {
    res.send("pong");
});
 
router.get("/list", (req, res) => {
    const serverInfo = [
        {
            name: "Server Test", // đổi theo tên bạn muốn
            ip: "req.hostname",          // hostname từ request
            address: "http://localhost:2567"
        }, {
            name: "Trái đất", // đổi theo tên bạn muốn
            ip: "req.hostname",          // hostname từ request
            address: "https://petwarserver.onrender.com"
        }
    ] 
    res.json(serverInfo);
});

export default router;
