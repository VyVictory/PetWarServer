import express from "express";
import { createServer } from "http";
import { Server } from "colyseus";
import { WebSocketTransport } from "@colyseus/ws-transport";
import appConfig from "./app.config";
import routes from "./routes";
import { connectDB } from "./database/database";

const app = express();

// Middleware + routes
app.use(express.json());
app.use("/", routes);

// Connect DB
connectDB();

// HTTP server
const server = createServer(app);
server.timeout = 0;
server.keepAliveTimeout = 0;

// Colyseus server
const gameServer = new Server({
    transport: new WebSocketTransport({ server }),
});

// Rooms
appConfig(gameServer);

// Port từ Render
const PORT = process.env.PORT || 2567; 
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));



