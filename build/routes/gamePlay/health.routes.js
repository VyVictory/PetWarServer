"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
router.get("/", (req, res) => {
    res.send("Hello from Express API!");
});
router.get("/join", (req, res) => {
    res.json({ status: "ok" });
});
exports.default = router;
