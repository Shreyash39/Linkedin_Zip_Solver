import React, { useState } from "react";

const COLOR_START = "#1ec7f7";
const COLOR_END   = "#0062da";

function lerp(a, b, t) { return a + (b - a) * t; }

function lerpColor(hex1, hex2, t) {
  const p = (h) => [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
  const [r1, g1, b1] = p(hex1);
  const [r2, g2, b2] = p(hex2);
  const r = Math.round(lerp(r1, r2, t)).toString(16).padStart(2, '0');
  const g = Math.round(lerp(g1, g2, t)).toString(16).padStart(2, '0');
  const b = Math.round(lerp(b1, b2, t)).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

export default function ZipVisualizer({ matrix, solution, hWalls, vWalls, cellSize = 56 }) {
  const [hoveredStep, setHoveredStep] = useState(null);

  if (!matrix || !solution || !solution.length) return null;

  const m = matrix.length;
  const n = matrix[0].length;
  const total = solution.length;
  const W = n * cellSize;
  const H = m * cellSize;

  // Build position → index lookup
  const posMap = Array.from({ length: m }, () => Array(n).fill(-1));
  solution.forEach(([r, c], i) => { posMap[r][c] = i; });

  // SVG path for the solution trail
  function getPathD() {
    return solution
      .map(([r, c], i) => {
        const x = c * cellSize + cellSize / 2;
        const y = r * cellSize + cellSize / 2;
        return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
      })
      .join(' ');
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg
        width={W}
        height={H}
        viewBox={`0 0 ${W} ${H}`}
        style={{
          display: 'block',
          background: '#fafafa',
          borderRadius: 14,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          maxWidth: '100%',
        }}
      >
        <defs>
          <linearGradient id="sol-grad" x1="0" y1="0" x2={W} y2={H} gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor={COLOR_START} />
            <stop offset="100%" stopColor={COLOR_END} />
          </linearGradient>
        </defs>

        {/* ── Cell backgrounds ─────────────────────────── */}
        {Array.from({ length: m }, (_, r) =>
          Array.from({ length: n }, (_, c) => {
            const idx = posMap[r][c];
            const isOnPath = idx !== -1;
            const isHovered = isOnPath && idx === hoveredStep;
            const t = isOnPath ? idx / (total - 1) : 0;
            const pathColor = lerpColor(COLOR_START, COLOR_END, t);

            return (
              <rect key={`bg-${r}-${c}`}
                x={c * cellSize + 1} y={r * cellSize + 1}
                width={cellSize - 2} height={cellSize - 2}
                fill={isOnPath ? `${pathColor}18` : '#fff'}
                stroke={isHovered ? pathColor : '#e5e7eb'}
                strokeWidth={isHovered ? 2 : 1}
                rx={5}
              />
            );
          })
        )}

        {/* ── Solution path ─────────────────────────────── */}
        <path
          d={getPathD()}
          stroke="url(#sol-grad)"
          strokeWidth={cellSize * 0.62}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.82}
        />

        {/* ── Walls ──────────────────────────────────────── */}
        {hWalls && vWalls && Array.from({ length: m }, (_, r) =>
          Array.from({ length: n }, (_, c) => {
            const els = [];
            // Right wall: hWalls[r][c]
            if (c < n - 1 && hWalls[r] && hWalls[r][c] === 1) {
              const wx = (c + 1) * cellSize;
              const wy = r * cellSize;
              els.push(
                <line key={`hw-${r}-${c}`}
                  x1={wx} y1={wy + 3}
                  x2={wx} y2={wy + cellSize - 3}
                  stroke="#e74c3c"
                  strokeWidth={5}
                  strokeLinecap="round"
                />
              );
            }
            // Bottom wall: vWalls[r][c]
            if (r < m - 1 && vWalls[r] && vWalls[r][c] === 1) {
              const wx = c * cellSize;
              const wy = (r + 1) * cellSize;
              els.push(
                <line key={`vw-${r}-${c}`}
                  x1={wx + 3} y1={wy}
                  x2={wx + cellSize - 3} y2={wy}
                  stroke="#e74c3c"
                  strokeWidth={5}
                  strokeLinecap="round"
                />
              );
            }
            return els;
          })
        )}

        {/* ── Numbered dots ──────────────────────────────── */}
        {solution.map(([r, c], i) => {
          const val = matrix[r][c];
          const hasNum = typeof val === 'number' && val > 0;
          const t = i / (total - 1);
          const pathColor = lerpColor(COLOR_START, COLOR_END, t);
          const x = c * cellSize + cellSize / 2;
          const y = r * cellSize + cellSize / 2;

          return (
            <g key={`dot-${i}`}
              onMouseEnter={() => setHoveredStep(i)}
              onMouseLeave={() => setHoveredStep(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={x} cy={y}
                r={cellSize * 0.27}
                fill={hasNum ? '#1a1a1a' : pathColor}
                stroke={hasNum ? '#fff' : 'none'}
                strokeWidth={2}
              />
              {hasNum && (
                <text
                  x={x} y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="#fff"
                  fontWeight="700"
                  fontSize={val >= 10 ? cellSize * 0.26 : cellSize * 0.3}
                  fontFamily="'IBM Plex Mono', monospace"
                >
                  {val}
                </text>
              )}
            </g>
          );
        })}

        {/* ── Outer border ───────────────────────────────── */}
        <rect x={1} y={1} width={W - 2} height={H - 2}
          fill="none" stroke="#d1d5db" strokeWidth={1.5} rx={13} />
      </svg>

      {/* Step counter */}
      <div style={{
        marginTop: 10,
        fontSize: '0.8rem',
        color: '#888',
        fontFamily: "'IBM Plex Mono', monospace",
        letterSpacing: '0.5px',
      }}>
        {hoveredStep !== null
          ? `Step ${hoveredStep + 1} / ${total}  →  cell (${solution[hoveredStep][0]}, ${solution[hoveredStep][1]})${
              matrix[solution[hoveredStep][0]][solution[hoveredStep][1]] > 0
                ? `  #${matrix[solution[hoveredStep][0]][solution[hoveredStep][1]]}`
                : ''
            }`
          : `${total} cells  ·  hover to inspect`
        }
      </div>
    </div>
  );
}
