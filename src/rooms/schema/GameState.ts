import { Schema, type, ArraySchema } from "@colyseus/schema";

export class Cell extends Schema {
  @type("int8") type: number = 0;
  @type("int16") value: number = 0;
}

export class GameState extends Schema {
  @type([Cell])
  board: ArraySchema<Cell> = new ArraySchema<Cell>();

  @type("int8") currentTurn: number = 0;
  @type("int8") timer: number = 9;
}
