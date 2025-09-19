import { Room, Client } from "colyseus";
import { GameState, Cell } from "./schema/GameState";
import { ArraySchema } from "@colyseus/schema";

type Point = { x: number; y: number };

const BOARD_SIZE = 8;
const CELL_TYPES = 5;

export class Match3Room extends Room<GameState> {
    maxClients = 2;

    onCreate(options: any) {
        console.log("Room created!");
        const state = new GameState();
        state.board = new ArraySchema<Cell>();
        for (let y = 0; y < BOARD_SIZE; y++) {
            for (let x = 0; x < BOARD_SIZE; x++) {
                let type: number;
                do {
                    type = Math.floor(Math.random() * CELL_TYPES);
                } while (
                    (x >= 2 &&
                        state.board[y * BOARD_SIZE + x - 1].type === type &&
                        state.board[y * BOARD_SIZE + x - 2].type === type) ||
                    (y >= 2 &&
                        state.board[(y - 1) * BOARD_SIZE + x].type === type &&
                        state.board[(y - 2) * BOARD_SIZE + x].type === type)
                );

                const cell = new Cell();
                cell.type = type;
                cell.value = 10;
                state.board[y * BOARD_SIZE + x] = cell;
            }
        }
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
        this.onMessage("swap", (client, data: { a: Point; b: Point }) => {
            const playerIndex = this.getPlayerIndex(client);
            if (playerIndex !== this.state.currentTurn) return;

            // Swap cells tạm thời
            this.swapCells(data.a, data.b);
            let matches = this.findMatches();

            if (matches.length === 0) {
                // Không match → revert và gửi thông báo invalid
                this.swapCells(data.a, data.b);
                client.send("swap_result", { valid: false, swap: {}, broken: [], spawned: [], batch: 0 });
                return;
            }

            // Match hợp lệ → xử lý theo batch
            let batch = 1;
            let allBroken: Point[] = [];
            let allSpawned: any[] = [];

            while (matches.length > 0) {
                const { broken, spawned } = this.collapseAndSpawn(matches);
                allBroken.push(...broken);
                allSpawned.push(...spawned);

                // Gửi batch riêng tới client
                this.broadcast("swap_result", {
                    valid: true,
                    broken,
                    swap: { a: data.a, b: data.b },
                    spawned,
                    batch
                });
                matches = this.findMatches();
                batch++;
            }

            this.nextTurn();
        });
    }

    onJoin(client: Client) {
        // console.log(`Player joined, index = ${this.getPlayerIndex(client)}`);
        // Gửi trực tiếp object, không cần JSON.stringify
        client.send("init", {
            board: this.state.board,       // ArraySchema<Cell>
            playerIndex: this.getPlayerIndex(client),
        });
    }
    onLeave(client: Client, consented: boolean) {
        console.log(`Player left: index=${this.getPlayerIndex(client)}, consented=${consented}`);

        // Nếu không còn client nào trong phòng, đóng phòng
        if (this.clients.length === 0) {
            console.log("❌ All players left, disposing room...");
            this.clock.clear(); // Dừng các interval timer nếu có
            this.disconnect();   // Ngắt kết nối phòng và dọn dẹp
        }
    }

    getPlayerIndex(client: Client) {
        return this.clients.indexOf(client);
    }

    nextTurn() {
        this.state.currentTurn = 0;
        // this.state.currentTurn = 1 - this.state.currentTurn;
        this.state.timer = 9;
        console.log(`🔄 Next turn: Player ${this.state.currentTurn}`);
    }

    getCell(x: number, y: number) { return this.state.board[y * BOARD_SIZE + x]; }
    setCell(x: number, y: number, cell: Cell) { this.state.board[y * BOARD_SIZE + x] = cell; }

    swapCells(a: Point, b: Point) {
        const ca = this.getCell(a.x, a.y);
        const cb = this.getCell(b.x, b.y);
        this.setCell(a.x, a.y, cb);
        this.setCell(b.x, b.y, ca);
    }

    findMatches(): Point[] {
        const matches: Point[] = [];

        // Ngang
        for (let y = 0; y < BOARD_SIZE; y++) {
            let streak = 1;
            for (let x = 1; x < BOARD_SIZE; x++) {
                if (this.getCell(x, y).type === this.getCell(x - 1, y).type) streak++;
                else {
                    if (streak >= 3) for (let k = 0; k < streak; k++) matches.push({ x: x - 1 - k, y });
                    streak = 1;
                }
            }
            if (streak >= 3) for (let k = 0; k < streak; k++) matches.push({ x: BOARD_SIZE - 1 - k, y });
        }

        // Dọc
        for (let x = 0; x < BOARD_SIZE; x++) {
            let streak = 1;
            for (let y = 1; y < BOARD_SIZE; y++) {
                if (this.getCell(x, y).type === this.getCell(x, y - 1).type) streak++;
                else {
                    if (streak >= 3) for (let k = 0; k < streak; k++) matches.push({ x, y: y - 1 - k });
                    streak = 1;
                }
            }
            if (streak >= 3) for (let k = 0; k < streak; k++) matches.push({ x, y: BOARD_SIZE - 1 - k });
        }

        if (matches.length > 0) {
            // console.log("✨ Matches found:", matches);
        }

        return matches;
    }

    // collapseAndSpawn(matchPoints: Point[]): { broken: Point[]; spawned: any[] } {
    //     // console.log("💥 Collapse triggered with points:", matchPoints);

    //     const spawned: any[] = [];
    //     const brokenSet = new Set(matchPoints.map(p => `${p.x},${p.y}`));

    //     const remainingCols: Cell[][] = Array.from({ length: BOARD_SIZE }, (): Cell[] => []);

    //     for (let x = 0; x < BOARD_SIZE; x++) {
    //         for (let y = 0; y < BOARD_SIZE; y++) {
    //             if (!brokenSet.has(`${x},${y}`)) remainingCols[x].push(this.getCell(x, y));
    //         }
    //     }

    //     for (let x = 0; x < BOARD_SIZE; x++) {
    //         let pointer = BOARD_SIZE - 1;
    //         for (let i = remainingCols[x].length - 1; i >= 0; i--) {
    //             this.setCell(x, pointer--, remainingCols[x][i]);
    //         }

    //         for (let y = pointer; y >= 0; y--) {
    //             const cell = new Cell();
    //             cell.type = Math.floor(Math.random() * CELL_TYPES);
    //             cell.value = 10;
    //             this.setCell(x, y, cell);
    //             spawned.push({ x, y, type: cell.type, value: cell.value });
    //         }
    //     }


    //     this.printBoard(this.state.board);
    //     const uniqueBroken = Array.from(new Set(matchPoints.map(p => `${p.x},${p.y}`)))
    //         .map(str => {
    //             const [x, y] = str.split(',').map(Number);
    //             return { x, y };
    //         });
    //     return { broken: uniqueBroken, spawned };
    // }
    collapseAndSpawn(matchPoints: Point[]): { broken: Point[]; spawned: any[] } {
        // 1️⃣ Loại trừ duplicate broken
        const brokenSet = new Set(matchPoints.map(p => `${p.x},${p.y}`));
        const uniqueBroken: Point[] = Array.from(brokenSet).map(str => {
            const [x, y] = str.split(',').map(Number);
            return { x, y };
        });

        const spawned: any[] = [];

        // 2️⃣ Tạo mảng tạm cho từng cột chứa ô còn lại
        // const remainingCols: Cell[][] = Array.from({ length: BOARD_SIZE }, () => []);
        const remainingCols: Cell[][] = Array.from({ length: BOARD_SIZE }, (): Cell[] => []);

        for (let x = 0; x < BOARD_SIZE; x++) {
            for (let y = 0; y < BOARD_SIZE; y++) {
                if (!brokenSet.has(`${x},${y}`)) {
                    remainingCols[x].push(this.getCell(x, y));
                }
            }
        }

        // 3️⃣ Đặt các ô còn lại từ đáy lên
        for (let x = 0; x < BOARD_SIZE; x++) {
            let pointer = BOARD_SIZE - 1;
            for (let i = remainingCols[x].length - 1; i >= 0; i--) {
                this.setCell(x, pointer--, remainingCols[x][i]);
            }

            // 4️⃣ Spawn ô mới ở vị trí còn trống từ trên xuống
            for (let y = pointer; y >= 0; y--) {
                const cell = new Cell();
                cell.type = Math.floor(Math.random() * CELL_TYPES);
                cell.value = 10;
                this.setCell(x, y, cell);

                // Spawned luôn theo y trên xuống dưới, không trùng
                spawned.push({ x, y, type: cell.type, value: cell.value });
            }
        }

        // 5️⃣ Trả về broken & spawned
        return { broken: uniqueBroken, spawned };
    }

    handleSwap(a: Point, b: Point) {
        this.swapCells(a, b);

        let matches = this.findMatches();
        if (matches.length === 0) {
            this.swapCells(a, b); // revert nếu không match
            console.log("❌ No match found, swap reverted.");
            return { valid: false, broken: [], spawned: [], batch: 0 };
        }

        const brokenTotal: Point[] = [];
        const spawnedTotal: any[] = [];
        let batch = 1;

        while (matches.length > 0) {
            const { broken, spawned } = this.collapseAndSpawn(matches);
            brokenTotal.push(...broken);
            spawnedTotal.push(...spawned);

            // Gửi batch hiện tại (nếu muốn gửi từng đợt riêng) 

            matches = this.findMatches();
            batch++;
        }

        return { valid: true, broken: brokenTotal, spawned: spawnedTotal, batch: batch - 1 };
    }

    private printBoard(board: ArraySchema<Cell>) {
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
