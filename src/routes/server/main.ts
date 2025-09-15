import { Router } from "express";

const router = Router();

// Ping test
router.get("/ping", (_req, res) => {
    res.send("pong");
});
 
router.get("/list", (req, res) => {
    const serverInfo = [
        {
            name: "TEST", // đổi theo tên bạn muốn
            socket: "ws://localhost:2567",          // hostname từ request
            address: "http://localhost:2567"
        }, {
            name: "TRÁI ĐẤT", // đổi theo tên bạn muốn
            socket: "wss://petwarserver.onrender.com",          // hostname từ request
            address: "https://petwarserver.onrender.com"
        }

    ] 
    res.json(serverInfo);
});

export default router;
