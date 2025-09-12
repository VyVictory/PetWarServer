import { Server } from "colyseus";
import { Match3Room } from "./rooms/Match3Room";
export default function appConfig(gameServer: Server) {
    gameServer.define("match3", Match3Room);
    
};
