"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const colyseus_1 = require("colyseus");
const ws_transport_1 = require("@colyseus/ws-transport");
const app_config_1 = __importDefault(require("./app.config"));
const routes_1 = __importDefault(require("./routes"));
const database_1 = require("./database/database");
const app = (0, express_1.default)();
// Middleware + routes
app.use(express_1.default.json());
app.use("/", routes_1.default);
// Connect DB
(0, database_1.connectDB)();
// HTTP server
const server = (0, http_1.createServer)(app);
server.timeout = 0;
server.keepAliveTimeout = 0;
// Colyseus server
const gameServer = new colyseus_1.Server({
    transport: new ws_transport_1.WebSocketTransport({ server }),
});
// Rooms
(0, app_config_1.default)(gameServer);
// Port từ Render
const PORT = process.env.PORT || 2567;
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
