import { Room, Client } from "colyseus";
import { GameState, Cell } from "./schema/GameState";

type Point = { x: number; y: number };

const BOARD_SIZE = 8;

export class Match3Room extends Room<GameState> {
    maxClients = 2;

    onCreate(options: any) {
        console.log("Room created!");
        const state = new GameState();

        // Tạo board 8x8, đảm bảo không có match khi khởi tạo
        for (let y = 0; y < BOARD_SIZE; y++) {
            for (let x = 0; x < BOARD_SIZE; x++) {
                let cell: Cell;
                do {
                    cell = new Cell();
                    cell.type = Math.floor(Math.random() * 6);
                    cell.value = 10;
                    state.board[y * BOARD_SIZE + x] = cell;
                } while (this.createsMatch(x, y, state.board)); // kiểm tra match ngang/dọc
            }
        }

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

        // Xử lý swap từ client
        this.onMessage("swap", (client, data: { a: Point; b: Point }) => {
            if (this.getPlayerIndex(client) !== this.state.currentTurn) return;

            const result = this.handleSwap(data.a, data.b);

            if (!result.valid) {
                client.send("invalid_swap", data);
                return;
            }

            this.broadcast("swap_result", result);
            this.nextTurn();
        });
    }

    onJoin(client: Client) {
        console.log("Client joined:", client.sessionId);
        client.send("init", JSON.stringify({
            board: this.state.board,
            playerIndex: this.getPlayerIndex(client),
        }));

        console.log("All clients in room:", this.clients.map((c) => c.sessionId));
    }

    onLeave(client: Client) {
        console.log("Client left:", client.sessionId);
        console.log("Remaining:", this.clients.map((c) => c.sessionId));
    }

    getPlayerIndex(client: Client): number {
        return this.clients.indexOf(client);
    }

    nextTurn() {
        this.state.currentTurn = 1 - this.state.currentTurn;
        this.state.timer = 9;
    }

    // ===================================================
    // Match-3 core (flatten board)
    // ===================================================

    getCell(x: number, y: number): Cell {
        return this.state.board[y * BOARD_SIZE + x];
    }

    setCell(x: number, y: number, cell: Cell) {
        this.state.board[y * BOARD_SIZE + x] = cell;
    }

    swapCells(a: Point, b: Point): boolean {
        const ca = this.getCell(a.x, a.y);
        const cb = this.getCell(b.x, b.y);

        if (ca.type === cb.type) return false;

        this.setCell(a.x, a.y, cb);
        this.setCell(b.x, b.y, ca);

        return true;
    }

    // Kiểm tra match ngang/dọc tại (x, y) trên board
    createsMatch(x: number, y: number, board: Cell[]): boolean {
        const type = board[y * BOARD_SIZE + x].type;

        // ngang
        if (x >= 2) {
            if (board[y * BOARD_SIZE + x - 1].type === type &&
                board[y * BOARD_SIZE + x - 2].type === type) return true;
        }

        // dọc
        if (y >= 2) {
            if (board[(y - 1) * BOARD_SIZE + x].type === type &&
                board[(y - 2) * BOARD_SIZE + x].type === type) return true;
        }

        return false;
    }

    findMatches(): Point[] {
        const matches: Point[] = [];

        // ngang
        for (let y = 0; y < BOARD_SIZE; y++) {
            let streak = 1;
            for (let x = 1; x < BOARD_SIZE; x++) {
                if (this.getCell(x, y).type === this.getCell(x - 1, y).type) {
                    streak++;
                } else {
                    if (streak >= 3) {
                        for (let k = 0; k < streak; k++) matches.push({ x: x - 1 - k, y });
                    }
                    streak = 1;
                }
            }
            if (streak >= 3) {
                for (let k = 0; k < streak; k++) matches.push({ x: BOARD_SIZE - 1 - k, y });
            }
        }

        // dọc
        for (let x = 0; x < BOARD_SIZE; x++) {
            let streak = 1;
            for (let y = 1; y < BOARD_SIZE; y++) {
                if (this.getCell(x, y).type === this.getCell(x, y - 1).type) {
                    streak++;
                } else {
                    if (streak >= 3) {
                        for (let k = 0; k < streak; k++) matches.push({ x, y: y - 1 - k });
                    }
                    streak = 1;
                }
            }
            if (streak >= 3) {
                for (let k = 0; k < streak; k++) matches.push({ x, y: BOARD_SIZE - 1 - k });
            }
        }

        return matches;
    }

    collapseAndSpawn(matchPoints: Point[]): { broken: Point[]; spawned: any[] } {
        const spawned: any[] = [];

        for (let x = 0; x < BOARD_SIZE; x++) {
            let pointer = BOARD_SIZE - 1;
            for (let y = BOARD_SIZE - 1; y >= 0; y--) {
                const isBroken = matchPoints.some((p) => p.x === x && p.y === y);
                if (!isBroken) {
                    this.setCell(x, pointer, this.getCell(x, y));
                    pointer--;
                }
            }

            // spawn mới trên cùng
            for (let y = pointer; y >= 0; y--) {
                const cell = new Cell();
                cell.type = Math.floor(Math.random() * 6);
                cell.value = 10;
                this.setCell(x, y, cell);
                spawned.push({ x, y, type: cell.type, value: cell.value });
            }
        }

        return { broken: matchPoints, spawned };
    }

    handleSwap(a: Point, b: Point) {
        if (!this.swapCells(a, b))
            return { valid: false, broken: [], spawned: [] };

        const brokenTotal: Point[] = [];
        const spawnedTotal: any[] = [];

        let matches = this.findMatches();

        if (matches.length === 0) {
            // revert nếu không tạo match
            this.swapCells(a, b);
            return { valid: false, broken: [], spawned: [] };
        }

        while (matches.length > 0) {
            const { broken, spawned } = this.collapseAndSpawn(matches);
            brokenTotal.push(...broken);
            spawnedTotal.push(...spawned);

            matches = this.findMatches(); // check chain
        }

        return { valid: true, broken: brokenTotal, spawned: spawnedTotal };
    }
}
