import { Client } from "colyseus.js";

const client = new Client("https://petwarserver.onrender.com");

async function test() {
    try {
        const room = await client.joinOrCreate("match3");
        console.log("✅ Joined room!", room.sessionId);

        room.onMessage("init", (message) => {
            console.log("Init message:", message);
        });
    } catch (e) {
        console.error("Error joining room:", e.message);
    }
}

test();
