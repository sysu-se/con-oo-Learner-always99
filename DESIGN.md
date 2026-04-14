# DESIGN

## 这次改了什么

本次在 Homework 1 的基础上做了两类最小改动：

1. 完善领域对象：
   - 为 `Sudoku` 增加了行、列、九宫格校验逻辑。
   - 为 `Sudoku` / `Game` 补充了参数类型与范围检查。
   - `Sudoku` 负责棋盘状态与冲突检测，`Game` 负责历史、Undo/Redo。

2. 接入真实 Svelte 流程：
   - 保留原项目的 `grid` / `userGrid` store 入口，不大改组件结构。
   - 在 `src/node_modules/@sudoku/stores/grid.js` 内部持有真正的 `Game` 对象。
   - 组件不再直接修改二维数组，而是调用 `userGrid.guess()`、`userGrid.undo()`、`userGrid.redo()`。

## 领域对象职责

### Sudoku
- 持有 9×9 grid
- 提供 `guess()`
- 提供 `isValidMove()` 与 `getInvalidCellKeys()`
- 提供 `clone()`、`toJSON()`、`toString()`

### Game
- 持有当前 `Sudoku`
- 管理 `history` 和 `future`
- 提供 `guess()`、`undo()`、`redo()`

## View 层如何消费领域对象

View 层没有直接操作 `Game` 内部字段，而是消费原有的 Svelte store：

- `grid`：原题面
- `userGrid`：当前局面
- `invalidCells`：冲突格

其中 `userGrid` store 内部实际上持有一个 `Game` 对象：

- `userGrid.guess(pos, value)` -> 调用 `currentGame.guess(...)`
- `userGrid.undo()` -> 调用 `currentGame.undo()`
- `userGrid.redo()` -> 调用 `currentGame.redo()`

调用完成后，再把 `currentGame.getSudoku().getGrid()` 重新 `set` 给 Svelte store，所以界面会刷新。

## 为什么 UI 会更新

本实现依赖的是 **Svelte store 的 `set()` 更新机制**。

仅仅修改对象内部字段，Svelte 不一定知道变化了；因此每次领域对象变化后，都会把新的二维数组重新写回 `userGrid` store。组件使用 `$userGrid`、`$invalidCells` 渲染，所以会自动刷新。

## 深拷贝策略

- `Sudoku` 在构造、`getGrid()`、`clone()` 时都做二维数组深拷贝。
- `Game` 的 history/future 存的是 `Sudoku` 快照，而不是共享同一个 grid 引用。

这样可以避免 Undo/Redo 时历史记录被后续修改污染。
