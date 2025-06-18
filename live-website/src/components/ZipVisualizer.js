import React from "react";

// Utility to interpolate between two colors
function lerpColor(a, b, t) {
  const ah = parseInt(a.replace(/#/g, ""), 16),
    ar = (ah >> 16) & 0xff,
    ag = (ah >> 8) & 0xff,
    ab = ah & 0xff,
    bh = parseInt(b.replace(/#/g, ""), 16),
    br = (bh >> 16) & 0xff,
    bg = (bh >> 8) & 0xff,
    bb = bh & 0xff,
    rr = ar + t * (br - ar),
    rg = ag + t * (bg - ag),
    rb = ab + t * (bb - ab);
  return (
    "#" +
    (
      (1 << 24) +
      (rr << 16) +
      (rg << 8) +
      rb
    )
      .toString(16)
      .slice(1)
  );
}

export default function ZipVisualizer({ matrix, solution, cellSize = 50 }) {
  if (!matrix || !solution || !solution.length) return null;

  const m = matrix.length, n = matrix[0].length;
  // Build a quick lookup for order in solution path
  const posMap = Array.from({ length: m }, () => Array(n).fill(-1));
  solution.forEach(([row, col], idx) => {
    posMap[row][col] = idx;
  });

  // Path color gradient
  const colorStart = "#1ec7f7";
  const colorEnd = "#0062da";

  // Calculate SVG path for the solution
  function getPathD() {
    return solution
      .map(([row, col], i) => {
        const x = col * cellSize + cellSize / 2;
        const y = row * cellSize + cellSize / 2;
        return i === 0 ? `M${x},${y}` : `L${x},${y}`;
      })
      .join(" ");
  }

  return (
    <div style={{ overflow: "auto", background: "#fff", padding: 24, borderRadius: 16 }}>
      <svg
        width={n * cellSize}
        height={m * cellSize}
        style={{ display: "block", background: "#fff" }}
      >
        {/* Draw solution path with gradient */}
        <defs>
          <linearGradient id="path-gradient" x1="0" y1="0" x2={n * cellSize} y2={m * cellSize} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={colorStart} />
            <stop offset="100%" stopColor={colorEnd} />
          </linearGradient>
        </defs>
        {/* Solution path */}
        <path
          d={getPathD()}
          stroke="url(#path-gradient)"
          strokeWidth={cellSize * 0.7}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Number dots */}
        {solution.map(([row, col], i) => {
          const x = col * cellSize + cellSize / 2;
          const y = row * cellSize + cellSize / 2;
          const value = matrix[row][col];
          const dotColor = "#111";
          const textColor = "#fff";
          return (
            <g key={i}>
              <circle
                cx={x}
                cy={y}
                r={cellSize * 0.28}
                fill={dotColor}
                stroke="#222"
                strokeWidth={2}
              />
              {typeof value === "number" && value > 0 && (
                <text
                  x={x}
                  y={y + 1}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill={textColor}
                  fontWeight="bold"
                  fontSize={cellSize * 0.32}
                  style={{
                    fontFamily: "system-ui, sans-serif"
                  }}
                >
                  {value}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}