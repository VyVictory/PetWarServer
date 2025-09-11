"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const i18n_1 = __importDefault(require("i18n"));
const path_1 = __importDefault(require("path"));
const express_1 = __importDefault(require("express"));
const app_config_1 = __importDefault(require("./app.config"));
const routes_1 = __importDefault(require("./routes"));
const config_1 = require("./config");
const colyseus_1 = require("colyseus");
const ws_transport_1 = require("@colyseus/ws-transport");
const http_1 = require("http");
const database_1 = require("./database/database");
i18n_1.default.configure({
    locales: ["en", "vi"], // danh sách ngôn ngữ
    directory: path_1.default.join(__dirname, "locales"), // thư mục chứa file JSON
    defaultLocale: "en",
    objectNotation: true,
});
process.env.NODE_ENV = "production";
const app = (0, express_1.default)();
app.use(i18n_1.default.init); // middleware
app.use(express_1.default.json());
app.use((req, res, next) => {
    let lang = req.headers["accept-language"];
    if (lang) {
        lang = lang.split(",")[0].split("-")[0];
        i18n_1.default.setLocale(req, lang);
    }
    else {
        i18n_1.default.setLocale(req, "vi");
    }
    next();
});
// Routes
app.use("/", routes_1.default);
//data connect
(0, database_1.connectDB)();
// HTTP + Colyseus
const server = (0, http_1.createServer)(app);
server.timeout = 0; // vô hiệu hóa timeout
server.keepAliveTimeout = 0; // giữ kết nối vô hạn
const gameServer = new colyseus_1.Server({
    transport: new ws_transport_1.WebSocketTransport({
        server: server,
        pingInterval: 10000,
        pingMaxRetries: 3
    })
});
(0, app_config_1.default)(gameServer);
server.listen(config_1.CONFIG.PORT, () => {
    console.log(`Server running at http://localhost:${config_1.CONFIG.PORT}`);
});
