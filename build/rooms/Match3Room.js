"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Match3Room = void 0;
const colyseus_1 = require("colyseus");
const GameState_1 = require("./schema/GameState");
const schema_1 = require("@colyseus/schema");
const BOARD_SIZE = 8;
const CELL_TYPES = 6;
class Match3Room extends colyseus_1.Room {
    constructor() {
        super(...arguments);
        this.maxClients = 2;
    }
    onCreate(options) {
        console.log("Room created!");
        const state = new GameState_1.GameState();
        // Khởi tạo board nhanh + ArraySchema
        state.board = new schema_1.ArraySchema();
        for (let y = 0; y < BOARD_SIZE; y++) {
            for (let x = 0; x < BOARD_SIZE; x++) {
                let type;
                do {
                    type = Math.floor(Math.random() * CELL_TYPES);
                } while ((x >= 2 &&
                    state.board[y * BOARD_SIZE + x - 1].type === type &&
                    state.board[y * BOARD_SIZE + x - 2].type === type) ||
                    (y >= 2 &&
                        state.board[(y - 1) * BOARD_SIZE + x].type === type &&
                        state.board[(y - 2) * BOARD_SIZE + x].type === type));
                const cell = new GameState_1.Cell();
                cell.type = type;
                cell.value = 10;
                state.board[y * BOARD_SIZE + x] = cell;
            }
        }
        console.log("Initial board:");
        this.printBoard(state.board);
        state.currentTurn = 0;
        state.timer = 9;
        this.setState(state);
        // countdown 1 giây
        this.clock.setInterval(() => {
            this.state.timer -= 1;
            if (this.state.timer <= 0) {
                this.nextTurn();
            }
        }, 1000);
        // Swap từ client
        this.onMessage("swap", (client, data) => {
            console.log(`Swap request from player ${this.getPlayerIndex(client)}:`, data);
            if (this.getPlayerIndex(client) !== this.state.currentTurn) {
                console.log("❌ Not this player's turn!");
                return;
            }
            const result = this.handleSwap(data.a, data.b);
            if (!result.valid) {
                console.log("❌ Invalid swap:", data);
                client.send("invalid_swap", data);
                return;
            }
            console.log("✅ Swap result:", result);
            this.broadcast("swap_result", result);
            this.nextTurn();
        });
    }
    onJoin(client) {
        console.log(`Player joined, index = ${this.getPlayerIndex(client)}`);
        client.send("init", JSON.stringify({
            board: this.state.board,
            playerIndex: this.getPlayerIndex(client),
        }));
    }
    getPlayerIndex(client) {
        return this.clients.indexOf(client);
    }
    nextTurn() {
        this.state.currentTurn = 1 - this.state.currentTurn;
        this.state.timer = 9;
        console.log(`🔄 Next turn: Player ${this.state.currentTurn}`);
    }
    getCell(x, y) { return this.state.board[y * BOARD_SIZE + x]; }
    setCell(x, y, cell) { this.state.board[y * BOARD_SIZE + x] = cell; }
    swapCells(a, b) {
        const ca = this.getCell(a.x, a.y);
        const cb = this.getCell(b.x, b.y);
        this.setCell(a.x, a.y, cb);
        this.setCell(b.x, b.y, ca);
    }
    findMatches() {
        const matches = [];
        // Ngang
        for (let y = 0; y < BOARD_SIZE; y++) {
            let streak = 1;
            for (let x = 1; x < BOARD_SIZE; x++) {
                if (this.getCell(x, y).type === this.getCell(x - 1, y).type)
                    streak++;
                else {
                    if (streak >= 3)
                        for (let k = 0; k < streak; k++)
                            matches.push({ x: x - 1 - k, y });
                    streak = 1;
                }
            }
            if (streak >= 3)
                for (let k = 0; k < streak; k++)
                    matches.push({ x: BOARD_SIZE - 1 - k, y });
        }
        // Dọc
        for (let x = 0; x < BOARD_SIZE; x++) {
            let streak = 1;
            for (let y = 1; y < BOARD_SIZE; y++) {
                if (this.getCell(x, y).type === this.getCell(x, y - 1).type)
                    streak++;
                else {
                    if (streak >= 3)
                        for (let k = 0; k < streak; k++)
                            matches.push({ x, y: y - 1 - k });
                    streak = 1;
                }
            }
            if (streak >= 3)
                for (let k = 0; k < streak; k++)
                    matches.push({ x, y: BOARD_SIZE - 1 - k });
        }
        if (matches.length > 0) {
            console.log("✨ Matches found:", matches);
        }
        return matches;
    }
    collapseAndSpawn(matchPoints) {
        console.log("💥 Collapse triggered with points:", matchPoints);
        const spawned = [];
        const brokenSet = new Set(matchPoints.map(p => `${p.x},${p.y}`));
        const remainingCols = Array.from({ length: BOARD_SIZE }, () => []);
        for (let x = 0; x < BOARD_SIZE; x++) {
            for (let y = 0; y < BOARD_SIZE; y++) {
                if (!brokenSet.has(`${x},${y}`))
                    remainingCols[x].push(this.getCell(x, y));
            }
        }
        for (let x = 0; x < BOARD_SIZE; x++) {
            let pointer = BOARD_SIZE - 1;
            for (let i = remainingCols[x].length - 1; i >= 0; i--) {
                this.setCell(x, pointer--, remainingCols[x][i]);
            }
            for (let y = pointer; y >= 0; y--) {
                const cell = new GameState_1.Cell();
                cell.type = Math.floor(Math.random() * CELL_TYPES);
                cell.value = 10;
                this.setCell(x, y, cell);
                spawned.push({ x, y, type: cell.type, value: cell.value });
            }
        }
        console.log("📥 Spawned new cells:", spawned);
        this.printBoard(this.state.board);
        return { broken: matchPoints, spawned };
    }
    handleSwap(a, b) {
        console.log(`🔄 Swapping (${a.x},${a.y}) <-> (${b.x},${b.y})`);
        this.swapCells(a, b);
        let matches = this.findMatches();
        if (matches.length === 0) {
            this.swapCells(a, b); // revert nếu không match
            console.log("❌ No match found, swap reverted.");
            return { valid: false, broken: [], spawned: [] };
        }
        const brokenTotal = [];
        const spawnedTotal = [];
        while (matches.length > 0) {
            const { broken, spawned } = this.collapseAndSpawn(matches);
            brokenTotal.push(...broken);
            spawnedTotal.push(...spawned);
            matches = this.findMatches();
        }
        console.log("✅ Swap success. Broken:", brokenTotal, "Spawned:", spawnedTotal);
        return { valid: true, broken: brokenTotal, spawned: spawnedTotal };
    }
    printBoard(board) {
        let str = "";
        for (let y = 0; y < BOARD_SIZE; y++) {
            const row = [];
            for (let x = 0; x < BOARD_SIZE; x++) {
                row.push(board[y * BOARD_SIZE + x].type);
            }
            str += row.join(" ") + "\n";
        }
        console.log("\n" + str);
    }
}
exports.Match3Room = Match3Room;
