import { Sudoku } from './Sudoku.js';

/**
 * 一局游戏对象，持有当前 Sudoku 并管理 Undo/Redo 历史。
 */
export class Game {
  /** @type {Sudoku} */
  #sudoku;
  /** @type {Sudoku[]} */
  #history;
  /** @type {Sudoku[]} */
  #future;

  /**
   * @param {Sudoku} sudoku
   */
  constructor(sudoku) {
    if (!(sudoku instanceof Sudoku)) {
      throw new TypeError('Game constructor requires a Sudoku instance');
    }
    this.#sudoku = sudoku.clone();
    this.#history = [];
    this.#future = [];
  }

  /** @returns {Sudoku} */
  getSudoku() {
    return this.#sudoku.clone();
  }

  /**
   * @param {{row: number, col: number, value: number}} move
   */
  guess(move) {
    const before = this.#sudoku.clone();
    this.#sudoku.guess(move);
    this.#history.push(before);
    this.#future = [];
  }

  undo() {
    if (!this.canUndo()) return;
    this.#future.push(this.#sudoku.clone());
    this.#sudoku = this.#history.pop();
  }

  redo() {
    if (!this.canRedo()) return;
    this.#history.push(this.#sudoku.clone());
    this.#sudoku = this.#future.pop();
  }

  canUndo() {
    return this.#history.length > 0;
  }

  canRedo() {
    return this.#future.length > 0;
  }

  /**
   * @returns {{sudoku: {grid: number[][]}, history: {grid:number[][]}[], future: {grid:number[][]}[]}}
   */
  toJSON() {
    return {
      sudoku: this.#sudoku.toJSON(),
      history: this.#history.map(item => item.toJSON()),
      future: this.#future.map(item => item.toJSON()),
    };
  }

  /**
   * @param {{sudoku: {grid: number[][]}, history?: {grid:number[][]}[], future?: {grid:number[][]}[]}} json
   * @returns {Game}
   */
  static fromJSON(json) {
    if (!json || typeof json !== 'object') {
      throw new TypeError('Game.fromJSON requires a json object');
    }

    const game = new Game(Sudoku.fromJSON(json.sudoku));
    game.#history = Array.isArray(json.history)
      ? json.history.map(item => Sudoku.fromJSON(item))
      : [];
    game.#future = Array.isArray(json.future)
      ? json.future.map(item => Sudoku.fromJSON(item))
      : [];
    return game;
  }
}
