import express from "express";
import appConfig from "./app.config";
import routes from "./routes";
import { CONFIG } from "./config";
import { Server } from "colyseus";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { createServer } from "http";
import { connectDB } from "./database/database";
import { listen } from "@colyseus/tools";

const app = express();

// Middleware
app.use(express.json());
// Routes
app.use("/", routes);

// Connect DB
connectDB();

// Use PORT from Render
const PORT = process.env.PORT || CONFIG.PORT;

// HTTP + Colyseus
const server = createServer(app);
server.timeout = 0;
server.keepAliveTimeout = 0;

const gameServer = new Server({
    transport: new WebSocketTransport({
        server: server,
        pingInterval: 10000,
        pingMaxRetries: 3,
    }),
});

// Config game rooms, etc
appConfig(gameServer);

// Start server
server.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`);
});
