"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// Ping test
router.get("/ping", (_req, res) => {
    res.send("pong");
});
router.get("/list", (req, res) => {
    const serverInfo = [
        {
            name: "TEST", // đổi theo tên bạn muốn
            ip: "req.hostname", // hostname từ request
            address: "http://localhost:2567"
        }, {
            name: "TRÁI ĐẤT", // đổi theo tên bạn muốn
            ip: "req.hostname", // hostname từ request
            address: "https://petwarserver.onrender.com"
        }
    ];
    res.json(serverInfo);
});
exports.default = router;
