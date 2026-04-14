import { Sudoku } from './Sudoku.js';
import { Game } from './Game.js';

/**
 * 根据输入数据创建一个数独对象。
 * @param {number[][]} input 初始棋盘数据
 * @returns {Sudoku}
 */
export function createSudoku(input) {
  return new Sudoku(input);
}

/**
 * 根据 JSON 数据恢复一个数独对象。
 * @param {{grid: number[][]}} json
 * @returns {Sudoku}
 */
export function createSudokuFromJSON(json) {
  return Sudoku.fromJSON(json);
}

/**
 * 根据给定的数独对象创建一个游戏对象。
 * @param {{sudoku: Sudoku}} param0
 * @returns {Game}
 */
export function createGame({ sudoku }) {
  return new Game(sudoku);
}

/**
 * 根据 JSON 数据恢复一个游戏对象。
 * @param {{sudoku: Object, history?: Object[], future?: Object[]}} json
 * @returns {Game}
 */
export function createGameFromJSON(json) {
  return Game.fromJSON(json);
}
