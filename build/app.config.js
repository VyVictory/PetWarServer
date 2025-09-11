"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = appConfig;
const MyRoom_1 = require("./rooms/MyRoom");
function appConfig(gameServer) {
    gameServer.define("my_room", MyRoom_1.MyRoom);
}
;
