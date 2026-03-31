// ─────────────────────────────────────────────────────────────
// LinkedIn Zip Puzzle Solver
// Ported from the original C++ implementation.
//
// A "Zip" puzzle requires a Hamiltonian path on a grid that:
//   1. Starts at cell with value 1.
//   2. Ends at the cell with the maximum value.
//   3. Visits ALL cells (MUST_VISIT_ALL_CELLS = true).
//   4. At each step, if moving to a numbered cell N, N must be
//      >= the last numbered cell visited (consecutive ordering).
//   5. Walls (hWalls / vWalls) block movement between cells.
//
// Algorithm: DFS backtracking with constraint pruning.
// Time:  O(4^(m*n)) worst case, pruning makes typical cases fast.
// Space: O(m*n)
// ─────────────────────────────────────────────────────────────

const MUST_VISIT_ALL_CELLS = true;

// Safety limit — prevents browser freeze on huge/unsolvable grids.
// Increase if you have very large grids and accept longer solve times.
const MAX_ITERATIONS = 5_000_000;

// ─────────────────────────────────────────────────────────────
function checkAllVisited(vis, mapNums) {
  for (let i = 0; i < vis.length; i++)
    for (let j = 0; j < vis[0].length; j++)
      if ((MUST_VISIT_ALL_CELLS || mapNums[i][j] !== -1) && !vis[i][j])
        return false;
  return true;
}

// ─────────────────────────────────────────────────────────────
function isValidMove(
  curRow, curCol, nxtRow, nxtCol,
  m, n, vis, hWalls, vWalls,
  lastNum, newNum,
  prevRow, prevCol
) {
  // Bounds
  if (nxtRow < 0 || nxtRow >= m || nxtCol < 0 || nxtCol >= n) return false;
  // Already visited
  if (vis[nxtRow][nxtCol]) return false;
  // No U-turn (not strictly necessary but avoids trivial cycles)
  if (nxtRow === prevRow && nxtCol === prevCol) return false;
  // Numbered cells must appear in non-decreasing order
  if (newNum !== -1 && newNum < lastNum) return false;

  // Wall checks
  // Moving right: hWalls[curRow][curCol] blocks passage to curCol+1
  if (nxtCol === curCol + 1) {
    if (curCol >= n - 1) return false;
    if (hWalls[curRow][curCol] === 1) return false;
  }
  // Moving left: hWalls[curRow][nxtCol] blocks passage from nxtCol+1 to nxtCol
  if (nxtCol === curCol - 1) {
    if (nxtCol < 0) return false;
    if (hWalls[curRow][nxtCol] === 1) return false;
  }
  // Moving down: vWalls[curRow][curCol] blocks passage to curRow+1
  if (nxtRow === curRow + 1) {
    if (curRow >= m - 1) return false;
    if (vWalls[curRow][curCol] === 1) return false;
  }
  // Moving up: vWalls[nxtRow][curCol] blocks passage from nxtRow+1 to nxtRow
  if (nxtRow === curRow - 1) {
    if (nxtRow < 0) return false;
    if (vWalls[nxtRow][curCol] === 1) return false;
  }

  return true;
}

// ─────────────────────────────────────────────────────────────
const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

function solve(
  mapNums, hWalls, vWalls,
  path, vis,
  row, col, lastNum, targetNum,
  res, state
) {
  if (state.found) return;
  if (++state.iters > MAX_ITERATIONS) { state.timedOut = true; return; }

  if (mapNums[row][col] === targetNum) {
    if (checkAllVisited(vis, mapNums)) {
      res.length = 0;
      for (const p of path) res.push([...p]);
      state.found = true;
    }
    if (state.found) return;
  }

  const m = mapNums.length;
  const n = mapNums[0].length;
  const prevRow = path.length >= 2 ? path[path.length - 2][0] : -1;
  const prevCol = path.length >= 2 ? path[path.length - 2][1] : -1;

  for (const [dr, dc] of DIRS) {
    const nr = row + dr;
    const nc = col + dc;
    const num = (nr >= 0 && nr < m && nc >= 0 && nc < n) ? mapNums[nr][nc] : -2;

    if (isValidMove(row, col, nr, nc, m, n, vis, hWalls, vWalls, lastNum, num, prevRow, prevCol)) {
      vis[nr][nc] = true;
      path.push([nr, nc]);
      solve(mapNums, hWalls, vWalls, path, vis, nr, nc,
        Math.max(lastNum, mapNums[nr][nc] === -1 ? lastNum : mapNums[nr][nc]),
        targetNum, res, state);
      if (state.found || state.timedOut) return;
      path.pop();
      vis[nr][nc] = false;
    }
  }
}

// ─────────────────────────────────────────────────────────────
// Public API
// Returns array of [row, col] for the solution path, or [] if none.
// Throws on invalid input.
// ─────────────────────────────────────────────────────────────
export default function solveZipPuzzle(the_map, h_walls, v_walls) {
  const m = the_map.length;
  if (m === 0) throw new Error('Matrix is empty.');
  const n = the_map[0].length;
  if (n === 0) throw new Error('Matrix has zero columns.');

  let startRow = -1, startCol = -1, targetNum = 0;

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      const v = the_map[i][j];
      if (v === 1) { startRow = i; startCol = j; }
      if (v !== -1) targetNum = Math.max(targetNum, v);
    }
  }

  if (startRow === -1) throw new Error('No starting cell found. Make sure at least one cell is numbered "1".');
  if (targetNum < 2)   throw new Error('At least two numbered cells are required (1 and a maximum value).');

  const vis = Array.from({ length: m }, () => Array(n).fill(false));
  vis[startRow][startCol] = true;

  const path  = [[startRow, startCol]];
  const res   = [];
  const state = { found: false, timedOut: false, iters: 0 };

  solve(the_map, h_walls, v_walls, path, vis, startRow, startCol,
    the_map[startRow][startCol] === -1 ? 0 : the_map[startRow][startCol],
    targetNum, res, state);

  if (state.timedOut) {
    throw new Error(
      `Solver reached the iteration limit (${MAX_ITERATIONS.toLocaleString()}) without a solution. ` +
      `Check your puzzle input or simplify the grid.`
    );
  }

  return state.found ? res : [];
}
