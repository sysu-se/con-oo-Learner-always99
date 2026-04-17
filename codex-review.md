# con-oo-Learner-always99 - Review

## Review 结论

当前实现已经把开始游戏、输入、提示、撤销/重做等主命令接入到 `Game`/`Sudoku`，不再是“领域对象只存在于测试里”；但题面固定格、胜利判定和部分响应式状态仍散落在旧 store / Svelte 层，导致领域模型不是数独业务的单一真相源，Svelte 接入也存在明显的响应式设计缺口。

## 总体评价

| 维度 | 评价 |
| --- | --- |
| OOP | fair |
| JS Convention | fair |
| Sudoku Business | fair |
| OOD | poor |

## 缺点

### 1. 固定题面不在领域模型内

- 严重程度：core
- 位置：src/domain/Sudoku.js:14-38; src/node_modules/@sudoku/stores/grid.js:19-29,55-58; src/node_modules/@sudoku/stores/keyboard.js:6-10; src/components/Board/index.svelte:48-51
- 原因：`Sudoku` 只保存当前 grid，`guess()` 也不区分题目 givens 与玩家输入；固定格不可编辑、`userNumber` 的判定、界面渲染所需的原始题面都仍依赖独立的 `grid` store。这样 `Game`/`Sudoku` 无法单独表达一局数独的完整业务语义，也无法独立恢复“哪些格可改、哪些格不可改”的状态，属于职责边界没有收拢到领域层的核心问题。

### 2. Undo/Redo 按钮状态不是响应式数据

- 严重程度：major
- 位置：src/components/Controls/ActionBar/Actions.svelte:11-13
- 原因：`undoDisabled` / `redoDisabled` 在 `$:` 中调用的是 `userGrid.canUndo()` / `canRedo()` 这种普通方法，而不是可订阅 store 值。按 Svelte 3 的依赖收集规则，这两个 reactive statement 只会跟踪 `$gamePaused`，不会因为历史栈变化而自动重算，静态上看会导致撤销/重做可用性与真实 `Game` 状态脱节。

### 3. 胜利判定绕开了现有领域规则

- 严重程度：major
- 位置：src/node_modules/@sudoku/stores/game.js:7-18; src/domain/Sudoku.js:85-94
- 原因：领域对象已经提供了 `Sudoku.isSolved()`，但 `gameWon` store 仍然直接遍历 `$userGrid` 并结合 `$invalidCells` 自己重写了一套完成判定。这样把同一业务规则拆成两份实现，后续如果 `Sudoku` 的完成/胜利语义调整，UI 层很容易和领域层发生漂移。

### 4. Svelte 适配层依赖模块级单例和手动镜像同步

- 严重程度：minor
- 位置：src/node_modules/@sudoku/stores/grid.js:13-17,49-99
- 原因：`currentGame` 是模块级可变单例，UI 真正订阅的是 `userGrid` 这份数组镜像；每次命令后都要手动 `syncUserGrid()`，`invalidCells` 也通过重新 `createSudoku($userGrid)` 计算。这个适配层能工作，但不是很好的 OOD/Svelte 架构：状态源被拆开，领域对象变化不会自然成为响应式边界，后续新增 UI 状态时很容易再出现类似 `canUndo()` 的非响应式漏洞。

## 优点

### 1. `Game` 统一了承载历史与命令入口

- 位置：src/domain/Game.js:17-59
- 原因：`guess`、`undo`、`redo` 和历史/未来栈都集中在 `Game` 内部，尤其 `guess()` 后会清空 future，职责划分比把撤销重做散落在组件事件里要清晰得多。

### 2. 主要交互路径已经经过领域对象

- 位置：src/node_modules/@sudoku/stores/grid.js:55-73; src/components/Controls/Keyboard.svelte:10-25; src/components/Controls/ActionBar/Actions.svelte:15-30
- 原因：键盘输入、提示、撤销、重做都不是直接改 `userGrid` 数组，而是调用 adapter，再委托给 `currentGame.guess()/undo()/redo()`。这说明真实界面的主流程已经部分接入了 `Game`。

### 3. 冲突检测规则被收敛到 `Sudoku`

- 位置：src/domain/Sudoku.js:47-79; src/node_modules/@sudoku/stores/grid.js:98-100
- 原因：无效格高亮没有在组件里重复写行/列/宫校验，而是复用了 `Sudoku.getInvalidCellKeys()`。这比把数独规则散写在 Svelte 模板和事件处理函数中更符合领域建模。

### 4. 封装与外表化接口比较完整

- 位置：src/domain/Sudoku.js:8-26,99-107; src/domain/Game.js:21-29,64-89
- 原因：`#grid` / `#sudoku` 等私有字段配合 clone、`toJSON()` / `fromJSON()`，体现了对封装边界和序列化需求的明确考虑，基础面向对象形态是成立的。

## 补充说明

- 本次结论仅基于静态阅读，未运行测试，也未实际打开页面验证交互。
- 关于 `undoDisabled` / `redoDisabled` 可能不更新等判断，依据的是 Svelte 3 对 `$:` 依赖收集和 custom store 消费方式的静态语义分析。
- 评审范围限定在 `src/domain/*` 以及直接消费这些领域对象的 Svelte 接线代码；因此一并检查了 `src/node_modules/@sudoku/stores/grid.js`、`src/node_modules/@sudoku/stores/game.js` 和相关组件。
- 未检查 `DESIGN.md` 或其他无关目录，因此文档层面的解释是否充分不在本次结论内。
