/**
 * 数独棋盘类，封装 9×9 棋盘数据及其基本操作。
 *
 * 支持棋盘初始化、获取棋盘副本、填数、克隆、
 * 序列化、反序列化以及字符串外表化显示。
 */
export class Sudoku {
  /** @type {number[][]} */
  #grid;

  /**
   * @param {number[][]} [inputGrid]
   */
  constructor(inputGrid) {
    const fallbackGrid = Array.from({ length: 9 }, () => Array(9).fill(0));
    const sourceGrid = inputGrid ?? fallbackGrid;
    this.#validateGrid(sourceGrid);
    this.#grid = Sudoku.#cloneGrid(sourceGrid);
  }

  /**
   * @returns {number[][]}
   */
  getGrid() {
    return Sudoku.#cloneGrid(this.#grid);
  }

  /**
   * 执行一次填数操作。仅做边界与类型校验，不阻止产生冲突，
   * 冲突检测由校验方法负责，便于 UI 高亮提示。
   *
   * @param {{row: number, col: number, value: number}} move
   */
  guess(move) {
    this.#validateMove(move);
    const { row, col, value } = move;
    this.#grid[row][col] = value;
  }

  /**
   * 判断在指定位置放置某个值是否满足行列宫约束。
   * value = 0 视为清空，始终合法。
   *
   * @param {{row: number, col: number, value: number}} move
   * @returns {boolean}
   */
  isValidMove(move) {
    this.#validateMove(move);
    const { row, col, value } = move;
    if (value === 0) return true;

    return (
      this.#isRowValid(row, col, value) &&
      this.#isColumnValid(row, col, value) &&
      this.#isBoxValid(row, col, value)
    );
  }

  /**
   * 返回当前棋盘中所有冲突格子的 key 列表，格式为 "x,y"。
   * 用于 Svelte 界面高亮。
   *
   * @returns {string[]}
   */
  getInvalidCellKeys() {
    const invalid = new Set();

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const value = this.#grid[row][col];
        if (value === 0) continue;

        if (!this.#isRowValid(row, col, value) || !this.#isColumnValid(row, col, value) || !this.#isBoxValid(row, col, value)) {
          invalid.add(`${col},${row}`);
        }
      }
    }

    return Array.from(invalid);
  }

  /**
   * @returns {boolean}
   */
  isComplete() {
    return this.#grid.every(row => row.every(value => value >= 1 && value <= 9));
  }

  /**
   * @returns {boolean}
   */
  isSolved() {
    return this.isComplete() && this.getInvalidCellKeys().length === 0;
  }

  /**
   * @returns {Sudoku}
   */
  clone() {
    return new Sudoku(this.getGrid());
  }

  /**
   * @returns {{grid: number[][]}}
   */
  toJSON() {
    return { grid: this.getGrid() };
  }

  /**
   * @returns {string}
   */
  toString() {
    let str = '';
    for (let i = 0; i < 9; i++) {
      if (i % 3 === 0 && i !== 0) str += '\n---------------------\n';
      for (let j = 0; j < 9; j++) {
        if (j % 3 === 0 && j !== 0) str += '| ';
        const val = this.#grid[i][j] === 0 ? '.' : this.#grid[i][j];
        str += val + ' ';
      }
      str += '\n';
    }
    return str;
  }

  /**
   * @param {{grid: number[][]}} json
   * @returns {Sudoku}
   */
  static fromJSON(json) {
    if (!json || typeof json !== 'object') {
      throw new TypeError('Sudoku.fromJSON requires a json object');
    }
    return new Sudoku(json.grid);
  }

  /**
   * @param {number[][]} grid
   */
  #validateGrid(grid) {
    if (!Array.isArray(grid) || grid.length !== 9) {
      throw new TypeError('Sudoku grid must be a 9x9 array');
    }

    for (const row of grid) {
      if (!Array.isArray(row) || row.length !== 9) {
        throw new TypeError('Sudoku grid must be a 9x9 array');
      }
      for (const value of row) {
        if (!Number.isInteger(value) || value < 0 || value > 9) {
          throw new RangeError('Sudoku cell values must be integers between 0 and 9');
        }
      }
    }
  }

  /**
   * @param {{row: number, col: number, value: number}} move
   */
  #validateMove(move) {
    if (!move || typeof move !== 'object') {
      throw new TypeError('move must be an object');
    }

    const { row, col, value } = move;
    if (!Number.isInteger(row) || row < 0 || row > 8) {
      throw new RangeError('move.row must be an integer between 0 and 8');
    }
    if (!Number.isInteger(col) || col < 0 || col > 8) {
      throw new RangeError('move.col must be an integer between 0 and 8');
    }
    if (!Number.isInteger(value) || value < 0 || value > 9) {
      throw new RangeError('move.value must be an integer between 0 and 9');
    }
  }

  /** @returns {number[][]} */
  static #cloneGrid(grid) {
    return grid.map(row => [...row]);
  }

  #isRowValid(targetRow, targetCol, value) {
    for (let col = 0; col < 9; col++) {
      if (col !== targetCol && this.#grid[targetRow][col] === value) {
        return false;
      }
    }
    return true;
  }

  #isColumnValid(targetRow, targetCol, value) {
    for (let row = 0; row < 9; row++) {
      if (row !== targetRow && this.#grid[row][targetCol] === value) {
        return false;
      }
    }
    return true;
  }

  #isBoxValid(targetRow, targetCol, value) {
    const startRow = Math.floor(targetRow / 3) * 3;
    const startCol = Math.floor(targetCol / 3) * 3;

    for (let row = startRow; row < startRow + 3; row++) {
      for (let col = startCol; col < startCol + 3; col++) {
        if ((row !== targetRow || col !== targetCol) && this.#grid[row][col] === value) {
          return false;
        }
      }
    }
    return true;
  }
}
