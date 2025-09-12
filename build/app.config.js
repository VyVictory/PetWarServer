"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = appConfig;
const Match3Room_1 = require("./rooms/Match3Room");
function appConfig(gameServer) {
    gameServer.define("match3", Match3Room_1.Match3Room);
}
;
