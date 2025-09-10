import { Server } from "colyseus";
import { MyRoom } from "./rooms/MyRoom";
export default function appConfig(gameServer: Server) {
    gameServer.define("my_room", MyRoom);
};
