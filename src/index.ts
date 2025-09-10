import i18n from "i18n";
import path from "path";
import express from "express";
import appConfig from "./app.config";
import routes from "./routes";
import { CONFIG } from "./config";
import { Server } from "colyseus";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { createServer } from "http";
import { connectDB } from "./database/database";
i18n.configure({
    locales: ["en", "vi"],  // danh sách ngôn ngữ
    directory: path.join(__dirname, "locales"), // thư mục chứa file JSON
    defaultLocale: "en",
    objectNotation: true,
});
process.env.NODE_ENV = "production";
const app = express();
app.use(i18n.init); // middleware
app.use(express.json())
app.use((req, res, next) => {
    let lang = req.headers["accept-language"];
    if (lang) { 
        lang = lang.split(",")[0].split("-")[0];
        i18n.setLocale(req, lang);
    } else {
        i18n.setLocale(req, "vi");
    }
    next();
}); 
// Routes
app.use("/", routes);
//data connect
connectDB();
// HTTP + Colyseus
const server = createServer(app)
server.timeout = 0;           // vô hiệu hóa timeout
server.keepAliveTimeout = 0;  // giữ kết nối vô hạn

const gameServer = new Server({
    transport: new WebSocketTransport({
        server: server,
        pingInterval: 10000,
        pingMaxRetries: 3
    })
});
appConfig(gameServer)
server.listen(CONFIG.PORT, () => {
    console.log(`Server running at http://localhost:${CONFIG.PORT}`)
})
