import React, { useState, useRef, useCallback } from 'react';

// ─── Constants ────────────────────────────────────────────────
const CELL = 56;          // cell size in px
const HIT  = 10;          // px from edge to detect wall-click
const WALL_W = 5;         // wall line width
const WALL_COLOR = '#e74c3c';
const WALL_HOVER_COLOR = 'rgba(231,76,60,0.3)';
const NUM_COLORS = {
  start: '#0a66c2',   // cell with value 1
  end:   '#057642',   // cell with max value
  other: '#1a1a1a',   // all other numbered cells
};

// ─── Helpers ──────────────────────────────────────────────────
function update2D(arr, r, c, val) {
  return arr.map((row, i) =>
    i === r ? row.map((v, j) => (j === c ? val : v)) : row
  );
}

function toggle2D(arr, r, c) {
  return update2D(arr, r, c, arr[r][c] === 1 ? 0 : 1);
}

function maxInMatrix(matrix) {
  let m = 0;
  matrix.forEach(row => row.forEach(v => { if (v > m) m = v; }));
  return m;
}

// ─── Component ────────────────────────────────────────────────
export default function InteractiveGrid({
  matrix, setMatrix,
  hWalls, setHWalls,
  vWalls, setVWalls,
  rows, cols,
}) {
  const [selected, setSelected] = useState(null); // [r, c]
  const [typingBuf, setTypingBuf] = useState('');
  const [wallHover, setWallHover] = useState(null); // { type:'h'|'v', r, c }
  const svgRef = useRef();

  const W = cols * CELL;
  const H = rows * CELL;
  const maxNum = maxInMatrix(matrix);

  // ── Click handler ────────────────────────────────────────────
  const handleClick = useCallback((e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top)  * scaleY;

    const c = Math.floor(x / CELL);
    const r = Math.floor(y / CELL);
    if (r < 0 || r >= rows || c < 0 || c >= cols) return;

    const cx = x - c * CELL;
    const cy = y - r * CELL;

    // Determine if near a border (wall zone)
    const nearLeft   = cx <= HIT   && c > 0;
    const nearRight  = cx >= CELL - HIT && c < cols - 1;
    const nearTop    = cy <= HIT   && r > 0;
    const nearBottom = cy >= CELL - HIT && r < rows - 1;

    if (nearLeft)   { setHWalls(prev => toggle2D(prev, r, c - 1)); return; }
    if (nearRight)  { setHWalls(prev => toggle2D(prev, r, c));     return; }
    if (nearTop)    { setVWalls(prev => toggle2D(prev, r - 1, c)); return; }
    if (nearBottom) { setVWalls(prev => toggle2D(prev, r, c));     return; }

    // Interior — select the cell
    setSelected([r, c]);
    setTypingBuf(matrix[r][c] === -1 ? '' : String(matrix[r][c]));
    svgRef.current.focus();
  }, [W, H, rows, cols, matrix, setHWalls, setVWalls]);

  // ── Mouse move — wall hover hints ────────────────────────────
  const handleMouseMove = useCallback((e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top)  * scaleY;

    const c = Math.floor(x / CELL);
    const r = Math.floor(y / CELL);
    if (r < 0 || r >= rows || c < 0 || c >= cols) { setWallHover(null); return; }

    const cx = x - c * CELL;
    const cy = y - r * CELL;

    if (cx <= HIT && c > 0)          setWallHover({ type: 'h', r, c: c - 1 });
    else if (cx >= CELL - HIT && c < cols - 1) setWallHover({ type: 'h', r, c });
    else if (cy <= HIT && r > 0)     setWallHover({ type: 'v', r: r - 1, c });
    else if (cy >= CELL - HIT && r < rows - 1) setWallHover({ type: 'v', r, c });
    else                              setWallHover(null);
  }, [W, H, rows, cols]);

  // ── Keyboard handler ─────────────────────────────────────────
  const handleKeyDown = useCallback((e) => {
    if (!selected) return;
    const [r, c] = selected;

    if (e.key >= '0' && e.key <= '9') {
      e.preventDefault();
      const newBuf = typingBuf + e.key;
      const num = parseInt(newBuf, 10);
      setTypingBuf(newBuf);
      setMatrix(prev => update2D(prev, r, c, num));
      return;
    }

    if (e.key === 'Backspace') {
      e.preventDefault();
      const newBuf = typingBuf.slice(0, -1);
      setTypingBuf(newBuf);
      setMatrix(prev => update2D(prev, r, c, newBuf === '' ? -1 : parseInt(newBuf, 10)));
      return;
    }

    if (e.key === 'Delete') {
      e.preventDefault();
      setTypingBuf('');
      setMatrix(prev => update2D(prev, r, c, -1));
      return;
    }

    if (e.key === 'Escape') {
      setSelected(null);
      setTypingBuf('');
      return;
    }

    // Arrow navigation
    const moves = { ArrowRight: [0,1], ArrowLeft: [0,-1], ArrowDown: [1,0], ArrowUp: [-1,0] };
    if (moves[e.key]) {
      e.preventDefault();
      setTypingBuf('');
      const [dr, dc] = moves[e.key];
      const nr = Math.max(0, Math.min(rows - 1, r + dr));
      const nc = Math.max(0, Math.min(cols - 1, c + dc));
      setSelected([nr, nc]);
      setTypingBuf(matrix[nr][nc] === -1 ? '' : String(matrix[nr][nc]));
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      setTypingBuf('');
      let nc = c + 1, nr = r;
      if (nc >= cols) { nc = 0; nr = r + 1; }
      if (nr >= rows) { nr = 0; nc = 0; }
      setSelected([nr, nc]);
      setTypingBuf(matrix[nr][nc] === -1 ? '' : String(matrix[nr][nc]));
    }
  }, [selected, typingBuf, rows, cols, matrix, setMatrix]);

  // ── Cursor style based on hover ──────────────────────────────
  const getCursor = useCallback((e) => {
    if (!e) return 'default';
    return wallHover ? 'crosshair' : 'default';
  }, [wallHover]);

  return (
    <svg
      ref={svgRef}
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      tabIndex={0}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setWallHover(null)}
      onKeyDown={handleKeyDown}
      style={{
        outline: 'none',
        cursor: wallHover ? 'crosshair' : 'default',
        userSelect: 'none',
        maxWidth: '100%',
        display: 'block',
        borderRadius: 12,
        boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      }}
    >
      {/* ── Background ─────────────────────────────────────── */}
      <rect x={0} y={0} width={W} height={H} fill="#fafafa" rx={12} />

      {/* ── Cells ──────────────────────────────────────────── */}
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => {
          const x = c * CELL, y = r * CELL;
          const val = matrix[r][c];
          const isSelected = selected && selected[0] === r && selected[1] === c;
          const hasNum = val !== -1 && val !== undefined;
          const isStart = val === 1;
          const isEnd   = hasNum && val === maxNum && maxNum > 1;
          const circleColor = isStart ? NUM_COLORS.start : isEnd ? NUM_COLORS.end : NUM_COLORS.other;

          return (
            <g key={`cell-${r}-${c}`}>
              {/* Cell rect */}
              <rect
                x={x + 1} y={y + 1}
                width={CELL - 2} height={CELL - 2}
                fill={isSelected ? '#dbeafe' : hasNum ? '#f0f7ff' : '#fff'}
                stroke={isSelected ? '#0a66c2' : '#e5e7eb'}
                strokeWidth={isSelected ? 2.5 : 1}
                rx={6}
              />
              {/* Number circle + text */}
              {hasNum && (
                <>
                  <circle
                    cx={x + CELL / 2} cy={y + CELL / 2}
                    r={CELL * 0.29}
                    fill={circleColor}
                    filter={isStart || isEnd ? 'url(#glow)' : undefined}
                  />
                  <text
                    x={x + CELL / 2} y={y + CELL / 2}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#fff"
                    fontSize={val >= 10 ? CELL * 0.265 : CELL * 0.3}
                    fontWeight="700"
                    fontFamily="'IBM Plex Mono', monospace"
                  >
                    {val}
                  </text>
                </>
              )}
              {/* "typing" cursor blink indicator */}
              {isSelected && !hasNum && (
                <text
                  x={x + CELL / 2} y={y + CELL / 2}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#93c5fd"
                  fontSize={CELL * 0.35}
                  fontWeight="700"
                  fontFamily="'IBM Plex Mono', monospace"
                >
                  _
                </text>
              )}
            </g>
          );
        })
      )}

      {/* ── Grid lines ─────────────────────────────────────── */}
      {Array.from({ length: rows + 1 }, (_, r) => (
        <line key={`hr-${r}`}
          x1={0} y1={r * CELL}
          x2={W} y2={r * CELL}
          stroke="#e5e7eb" strokeWidth={r === 0 || r === rows ? 0 : 0.5}
        />
      ))}
      {Array.from({ length: cols + 1 }, (_, c) => (
        <line key={`vc-${c}`}
          x1={c * CELL} y1={0}
          x2={c * CELL} y2={H}
          stroke="#e5e7eb" strokeWidth={c === 0 || c === cols ? 0 : 0.5}
        />
      ))}

      {/* ── Wall hover preview ──────────────────────────────── */}
      {wallHover && (() => {
        const { type, r, c } = wallHover;
        if (type === 'h') {
          // Right border of cell (r, c)
          const x = (c + 1) * CELL, y = r * CELL;
          const isActive = hWalls[r][c] === 1;
          return (
            <line
              x1={x} y1={y + 4}
              x2={x} y2={y + CELL - 4}
              stroke={isActive ? WALL_COLOR : WALL_HOVER_COLOR}
              strokeWidth={isActive ? WALL_W : 3}
              strokeLinecap="round"
            />
          );
        } else {
          const x = c * CELL, y = (r + 1) * CELL;
          const isActive = vWalls[r][c] === 1;
          return (
            <line
              x1={x + 4} y1={y}
              x2={x + CELL - 4} y2={y}
              stroke={isActive ? WALL_COLOR : WALL_HOVER_COLOR}
              strokeWidth={isActive ? WALL_W : 3}
              strokeLinecap="round"
            />
          );
        }
      })()}

      {/* ── Actual walls ───────────────────────────────────── */}
      {Array.from({ length: rows }, (_, r) =>
        Array.from({ length: cols }, (_, c) => {
          const elements = [];
          // Right wall: hWalls[r][c]
          if (c < cols - 1 && hWalls[r] && hWalls[r][c] === 1) {
            const x = (c + 1) * CELL, y = r * CELL;
            elements.push(
              <line key={`hw-${r}-${c}`}
                x1={x} y1={y + 4}
                x2={x} y2={y + CELL - 4}
                stroke={WALL_COLOR}
                strokeWidth={WALL_W}
                strokeLinecap="round"
              />
            );
          }
          // Bottom wall: vWalls[r][c]
          if (r < rows - 1 && vWalls[r] && vWalls[r][c] === 1) {
            const x = c * CELL, y = (r + 1) * CELL;
            elements.push(
              <line key={`vw-${r}-${c}`}
                x1={x + 4} y1={y}
                x2={x + CELL - 4} y2={y}
                stroke={WALL_COLOR}
                strokeWidth={WALL_W}
                strokeLinecap="round"
              />
            );
          }
          return elements;
        })
      )}

      {/* ── Outer border ───────────────────────────────────── */}
      <rect x={1} y={1} width={W - 2} height={H - 2}
        fill="none"
        stroke="#d1d5db"
        strokeWidth={1.5}
        rx={11}
      />

      {/* ── Defs ───────────────────────────────────────────── */}
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}
