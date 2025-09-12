"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameState = exports.Cell = void 0;
const schema_1 = require("@colyseus/schema");
class Cell extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.type = 0;
        this.value = 0;
    }
}
exports.Cell = Cell;
__decorate([
    (0, schema_1.type)("int8")
], Cell.prototype, "type", void 0);
__decorate([
    (0, schema_1.type)("int16")
], Cell.prototype, "value", void 0);
class GameState extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.board = new schema_1.ArraySchema();
        this.currentTurn = 0;
        this.timer = 9;
    }
}
exports.GameState = GameState;
__decorate([
    (0, schema_1.type)([Cell])
], GameState.prototype, "board", void 0);
__decorate([
    (0, schema_1.type)("int8")
], GameState.prototype, "currentTurn", void 0);
__decorate([
    (0, schema_1.type)("int8")
], GameState.prototype, "timer", void 0);
