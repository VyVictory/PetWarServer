"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app_config_1 = __importDefault(require("./app.config"));
const routes_1 = __importDefault(require("./routes"));
const config_1 = require("./config");
const colyseus_1 = require("colyseus");
const ws_transport_1 = require("@colyseus/ws-transport");
const http_1 = require("http");
const database_1 = require("./database/database");
const app = (0, express_1.default)();
// Middleware
app.use(express_1.default.json());
// Routes
app.use("/", routes_1.default);
// Connect DB
(0, database_1.connectDB)();
// Use PORT from Render
const PORT = process.env.PORT || config_1.CONFIG.PORT;
// HTTP + Colyseus
const server = (0, http_1.createServer)(app);
server.timeout = 0;
server.keepAliveTimeout = 0;
const gameServer = new colyseus_1.Server({
    transport: new ws_transport_1.WebSocketTransport({
        server: server,
        pingInterval: 10000,
        pingMaxRetries: 3,
    }),
});
// Config game rooms, etc
(0, app_config_1.default)(gameServer);
// Start server
server.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`);
});
