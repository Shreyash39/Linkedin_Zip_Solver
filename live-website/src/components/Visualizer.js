import React from 'react';

// Helper: get color gradient for path
function getColor(idx, total) {
  // blue gradient (LinkedIn style)
  const t = total <= 1 ? 0 : idx / (total - 1);
  const r = Math.round(24 + 60 * (1 - t)); // 24..84
  const g = Math.round(119 + 90 * (1 - t)); // 119..209
  const b = Math.round(242 + 13 * (1 - t)); // 242..255
  return `rgb(${r},${g},${b})`;
}

export default function Visualizer({ numbers, path, hWalls, vWalls }) {
  const m = numbers.length, n = numbers[0].length;
  const cellSize = 48, radius = 16, gap = 8;
  const gridW = n * cellSize + gap, gridH = m * cellSize + gap;

  // Map path to lookup for fast highlighting
  const pathSet = new Set(path.map(([i, j]) => `${i},${j}`));
  const pathIdx = {};
  path.forEach(([i, j], idx) => { pathIdx[`${i},${j}`] = idx; });

  // Helper: draw path as thick SVG polyline
  const points = path.map(([i, j]) => [
    j * cellSize + cellSize / 2 + gap / 2,
    i * cellSize + cellSize / 2 + gap / 2,
  ]);
  const pathLine = points.map(pt => pt.join(',')).join(' ');

  return (
    <div>
      <h2>Puzzle Solution</h2>
      <svg width={gridW} height={gridH} style={{ background: "#eaf1fa", borderRadius: 10 }}>
        {/* Path band */}
        {points.length >= 2 && (
          <polyline
            points={pathLine}
            fill="none"
            stroke="url(#zip-grad)"
            strokeWidth={16}
            strokeLinejoin="round"
            strokeLinecap="round"
            opacity={0.92}
          />
        )}
        <defs>
          <linearGradient id="zip-grad" x1="0" y1="0" x2={gridW} y2={gridH} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1877f2" />
            <stop offset="100%" stopColor="#0099ff" />
          </linearGradient>
        </defs>
        {/* Draw grid */}
        {[...Array(m)].map((_, i) =>
          [...Array(n)].map((_, j) => {
            const x = j * cellSize + gap / 2;
            const y = i * cellSize + gap / 2;
            const isOnPath = pathSet.has(`${i},${j}`);
            const idx = pathIdx[`${i},${j}`];
            // Wall overlays
            const hWall = j < n - 1 && hWalls[i][j] === 1;
            const vWall = i < m - 1 && vWalls[i][j] === 1;
            return (
              <g key={i + '-' + j}>
                {/* Cell background */}
                <rect x={x} y={y} width={cellSize} height={cellSize} fill="#fff" stroke="#d0d5df" rx={8} />
                {/* Wall overlays */}
                {hWall && (
                  <rect
                    x={x + cellSize - 4}
                    y={y + 3}
                    width={7}
                    height={cellSize - 6}
                    fill="#b4bccd"
                    rx={2}
                  />
                )}
                {vWall && (
                  <rect
                    x={x + 3}
                    y={y + cellSize - 4}
                    width={cellSize - 6}
                    height={7}
                    fill="#b4bccd"
                    rx={2}
                  />
                )}
                {/* Path highlight */}
                {isOnPath && (
                  <circle
                    cx={x + cellSize / 2}
                    cy={y + cellSize / 2}
                    r={radius + 2}
                    fill={getColor(idx, path.length)}
                    opacity={0.28}
                  />
                )}
                {/* Number disc */}
                {numbers[i][j] !== -1 && (
                  <circle
                    cx={x + cellSize / 2}
                    cy={y + cellSize / 2}
                    r={radius}
                    fill="#222"
                    stroke="#b6c4de"
                    strokeWidth={isOnPath ? 2.5 : 1}
                  />
                )}
                {/* Number text */}
                {numbers[i][j] !== -1 && (
                  <text
                    x={x + cellSize / 2}
                    y={y + cellSize / 2 + 5}
                    textAnchor="middle"
                    fontFamily="Segoe UI, Arial"
                    fontSize="1.15em"
                    fill="#fff"
                    fontWeight={600}
                  >
                    {numbers[i][j]}
                  </text>
                )}
              </g>
            );
          })
        )}
      </svg>
      <div style={{ marginTop: 16, fontSize: 14, color: "#555" }}>
        <b>Legend:</b> Black circles = clues, Colored band = path, Blue = start, Light blue = end.
      </div>
    </div>
  );
}