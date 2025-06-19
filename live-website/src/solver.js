// Robust solver for the Zip puzzle, ported from Main_cpp_originalCode.cpp
// Handles any m x n grid, can be set to visit all cells or just numbered cells

// Change this to 'true' if you want to visit ALL cells (including blanks),
// or leave as 'false' for "only numbered cells" (original behavior)
const MUST_VISIT_ALL_CELLS = true;

function checkAllVisited(vis, mapNums) {
  for (let i = 0; i < vis.length; ++i)
    for (let j = 0; j < vis[0].length; ++j)
      if ((MUST_VISIT_ALL_CELLS || mapNums[i][j] !== -1) && !vis[i][j]) return false;
  return true;
}

function isValidMove(curRow, curCol, nxtRow, nxtCol, m, n, vis, hWalls, vWalls, lastNum, newNum, prevRow, prevCol) {
  if (nxtRow < 0 || nxtRow >= m || nxtCol < 0 || nxtCol >= n) return false;
  if (vis[nxtRow][nxtCol]) return false;
  if (nxtRow === prevRow && nxtCol === prevCol) return false;
  if (newNum !== -1 && newNum < lastNum) return false;
  // Right
  if (nxtCol === curCol + 1 && (curCol >= n - 1 || hWalls[curRow][curCol] === 1)) return false;
  // Left
  if (nxtCol === curCol - 1 && (nxtCol < 0 || hWalls[curRow][nxtCol] === 1)) return false;
  // Down
  if (nxtRow === curRow + 1 && (curRow >= m - 1 || vWalls[curRow][curCol] === 1)) return false;
  // Up
  if (nxtRow === curRow - 1 && (nxtRow < 0 || vWalls[nxtRow][curCol] === 1)) return false;
  return true;
}

function solve(mapNums, hWalls, vWalls, path, vis, row, col, lastNum, targetNum, res, pathFound) {
  if (pathFound.found) return;
  if (mapNums[row][col] === targetNum) {
    if (checkAllVisited(vis, mapNums)) {
      res.length = 0;
      for (const p of path) res.push([...p]);
      pathFound.found = true;
    }
    if (pathFound.found) return;
  }
  const m = mapNums.length, n = mapNums[0].length;
  let prevRow = -1, prevCol = -1;
  if (path.length >= 2) {
    [prevRow, prevCol] = path[path.length - 2];
  }
  const dir = [
    [-1, 0], [1, 0], [0, -1], [0, 1]
  ];
  for (let d = 0; d < 4; ++d) {
    const [dr, dc] = dir[d];
    const nr = row + dr, nc = col + dc;
    const num = (nr >= 0 && nr < m && nc >= 0 && nc < n) ? mapNums[nr][nc] : -2;
    if (
      isValidMove(row, col, nr, nc, m, n, vis, hWalls, vWalls, lastNum, num, prevRow, prevCol)
    ) {
      vis[nr][nc] = true;
      path.push([nr, nc]);
      solve(mapNums, hWalls, vWalls, path, vis, nr, nc, Math.max(lastNum, mapNums[nr][nc]), targetNum, res, pathFound);
      if (pathFound.found) return;
      path.pop();
      vis[nr][nc] = false;
    }
  }
}

// Main export: returns array of [row, col] for path, or [] if no solution
export default function solveZipPuzzle(the_map, h_walls, v_walls) {
  const m = the_map.length, n = the_map[0].length;
  let startRow = -1, startCol = -1, targetNum = 0;
  for (let i = 0; i < m; ++i)
    for (let j = 0; j < n; ++j) {
      if (the_map[i][j] === 1) { startRow = i; startCol = j; }
      if (the_map[i][j] !== -1) targetNum = Math.max(targetNum, the_map[i][j]);
    }
  if (startRow === -1) throw new Error('Starting point (1) not found in matrix');
  const vis = Array.from({ length: m }, () => Array(n).fill(false));
  vis[startRow][startCol] = true;
  const path = [[startRow, startCol]];
  const res = [];
  const pathFound = { found: false };
  solve(the_map, h_walls, v_walls, path, vis, startRow, startCol, the_map[startRow][startCol], targetNum, res, pathFound);
  return pathFound.found ? res : [];
}
