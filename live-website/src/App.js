import React, { useState, useRef, useCallback } from 'react';
import InteractiveGrid from './components/InteractiveGrid';
import ZipVisualizer   from './components/ZipVisualizer';
import ImageOCRInput   from './components/ImageOCRInput';
import solveZipPuzzle  from './solver';

// ─── Helpers ─────────────────────────────────────────────────
function make2D(r, c, val) {
  return Array.from({ length: r }, () => Array(c).fill(val));
}

function clampRows(matrix, newRows, newCols, def) {
  return Array.from({ length: newRows }, (_, r) =>
    Array.from({ length: newCols }, (_, c) =>
      (matrix[r] && matrix[r][c] !== undefined) ? matrix[r][c] : def
    )
  );
}

const MIN_SIZE = 2;
const MAX_SIZE = 12;

// ─── App ─────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState('manual'); // 'manual' | 'ocr'

  const [rows, setRows] = useState(7);
  const [cols, setCols] = useState(7);

  const [matrix, setMatrix] = useState(make2D(7, 7, -1));
  const [hWalls, setHWalls] = useState(make2D(7, 7, 0));
  const [vWalls, setVWalls] = useState(make2D(7, 7, 0));

  const [solution, setSolution] = useState(null);
  const [error, setError]       = useState(null);
  const [solving, setSolving]   = useState(false);

  const [showPaste, setShowPaste] = useState(false);
  const pasteRef = useRef();

  // ── Grid resize ──────────────────────────────────────────
  function resize(newRows, newCols) {
    setRows(newRows);
    setCols(newCols);
    setMatrix(prev => clampRows(prev, newRows, newCols, -1));
    setHWalls(prev => clampRows(prev, newRows, newCols, 0));
    setVWalls(prev => clampRows(prev, newRows, newCols, 0));
    setSolution(null);
    setError(null);
  }

  function incRows() { if (rows < MAX_SIZE) resize(rows + 1, cols); }
  function decRows() { if (rows > MIN_SIZE) resize(rows - 1, cols); }
  function incCols() { if (cols < MAX_SIZE) resize(rows, cols + 1); }
  function decCols() { if (cols > MIN_SIZE) resize(rows, cols - 1); }

  // ── Clear grid ───────────────────────────────────────────
  function clearGrid() {
    setMatrix(make2D(rows, cols, -1));
    setHWalls(make2D(rows, cols, 0));
    setVWalls(make2D(rows, cols, 0));
    setSolution(null);
    setError(null);
  }

  function clearWalls() {
    setHWalls(make2D(rows, cols, 0));
    setVWalls(make2D(rows, cols, 0));
  }

  // ── OCR apply callback ───────────────────────────────────
  const handleOCRApply = useCallback((parsedMatrix, pRows, pCols) => {
    resize(pRows, pCols);
    // Small delay so resize state settles before we override matrix
    setTimeout(() => {
      setMatrix(parsedMatrix);
      setTab('manual');
    }, 50);
  }, []); // eslint-disable-line

  // ── Solve ────────────────────────────────────────────────
  function handleSolve() {
    setSolving(true);
    setSolution(null);
    setError(null);
    // Yield to UI before heavy computation
    setTimeout(() => {
      try {
        const result = solveZipPuzzle(
          matrix.map(r => r.slice()),
          hWalls.map(r => r.slice()),
          vWalls.map(r => r.slice()),
        );
        setSolution(result);
      } catch (e) {
        setError(e.message);
      } finally {
        setSolving(false);
      }
    }, 30);
  }

  // ── Paste parser ─────────────────────────────────────────
  function handlePasteParse() {
    const text = pasteRef.current?.value || '';
    const lines = text.trim().split('\n').map(l => l.trim());
    if (lines.length < 1) { alert('Empty input.'); return; }

    const sizeLine = lines[0].split(/\s+/);
    const m = parseInt(sizeLine[0], 10);
    const n = parseInt(sizeLine[1], 10);
    if (isNaN(m) || isNaN(n)) { alert('First line must be "rows cols".'); return; }

    const blocks = [];
    let curr = [];
    for (let i = 1; i < lines.length; i++) {
      if (lines[i] === '') { if (curr.length) { blocks.push(curr); curr = []; } }
      else curr.push(lines[i]);
    }
    if (curr.length) blocks.push(curr);
    if (blocks.length < 3) { alert('Need 3 matrices (numbers, hWalls, vWalls) separated by blank lines.'); return; }

    function parseBlock(b) {
      return b.map(line => line.split(/\s+/).map(s => { const v = parseInt(s,10); return isNaN(v) ? -1 : v; }));
    }

    const nm = parseBlock(blocks[0]);
    const hm = parseBlock(blocks[1]);
    const vm = parseBlock(blocks[2]);

    if (nm.length !== m || hm.length !== m || vm.length !== m) {
      alert(`Matrices must have ${m} rows.`); return;
    }

    resize(m, n);
    setTimeout(() => { setMatrix(nm); setHWalls(hm); setVWalls(vm); }, 50);
  }

  return (
    <div className="app-wrapper">
      {/* ─── Header ─────────────────────────────────────── */}
      <header className="app-header">
        <div className="app-logo">Z</div>
        <div>
          <h1 className="app-title">LinkedIn Zip Solver</h1>
          <p className="app-subtitle">Fill every cell · follow consecutive numbers · respect walls</p>
        </div>
      </header>

      {/* ─── Input Card ─────────────────────────────────── */}
      <div className="card">
        <div className="tab-bar">
          <button
            className={`tab-btn${tab === 'manual' ? ' active' : ''}`}
            onClick={() => setTab('manual')}
          >
            ✏️ Enter Puzzle
          </button>
          <button
            className={`tab-btn${tab === 'ocr' ? ' active' : ''}`}
            onClick={() => setTab('ocr')}
          >
            📷 Upload Image
          </button>
        </div>

        {/* ── Manual Tab ───────────────────────────────── */}
        {tab === 'manual' && (
          <>
            {/* Grid size */}
            <div className="size-row">
              {[['Rows', rows, decRows, incRows], ['Cols', cols, decCols, incCols]].map(
                ([label, val, dec, inc]) => (
                  <div className="size-group" key={label}>
                    <span className="size-label">{label}</span>
                    <div className="size-stepper">
                      <button className="size-step-btn" onClick={dec}>−</button>
                      <div className="size-value">{val}</div>
                      <button className="size-step-btn" onClick={inc}>+</button>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* Usage hints */}
            <div className="grid-hint">
              <span><strong>Click cell</strong> → type number (arrows to navigate)</span>
              <span><span className="hint-wall-line" /> <strong>Click cell border</strong> → toggle wall</span>
              <span>Delete/Backspace → clear cell</span>
            </div>

            {/* Interactive grid */}
            <div className="grid-wrap">
              <InteractiveGrid
                matrix={matrix}   setMatrix={setMatrix}
                hWalls={hWalls}   setHWalls={setHWalls}
                vWalls={vWalls}   setVWalls={setVWalls}
                rows={rows}       cols={cols}
              />
            </div>

            {/* Actions */}
            <div className="action-row">
              <button className="btn-primary" onClick={handleSolve} disabled={solving}>
                {solving ? '⏳ Solving…' : '⚡ Solve Puzzle'}
              </button>
              <button className="btn-secondary" onClick={clearGrid}>Clear Numbers</button>
              <button className="btn-secondary" onClick={clearWalls}>Clear Walls</button>
            </div>

            {/* Paste / Advanced (collapsed) */}
            <button className="paste-toggle" onClick={() => setShowPaste(v => !v)}>
              {showPaste ? '▾' : '▸'} Advanced: paste raw matrices
            </button>

            {showPaste && (
              <div className="paste-section">
                <label className="paste-label">
                  Format: first line = "rows cols", then 3 matrices (numbers, hWalls, vWalls) each separated by a blank line
                </label>
                <textarea
                  ref={pasteRef}
                  className="paste-textarea"
                  rows={Math.max(rows * 3 + 6, 18)}
                  placeholder={`7 7\n\n17 18 19 -1 -1 -1 -1\n...\n\n0 0 0 ...\n...\n\n0 0 0 ...\n...`}
                />
                <div className="action-row" style={{ marginTop: 10 }}>
                  <button className="btn-secondary" onClick={handlePasteParse}>Parse &amp; Load</button>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── OCR Tab ──────────────────────────────────── */}
        {tab === 'ocr' && (
          <ImageOCRInput onApply={handleOCRApply} />
        )}
      </div>

      {/* ─── Error ──────────────────────────────────────── */}
      {error && (
        <div className="error-box">⚠️ {error}</div>
      )}

      {/* ─── Solution Card ──────────────────────────────── */}
      {solution !== null && (
        <div className="card">
          {solution.length > 0 ? (
            <>
              <div className="solution-header">
                <h3 className="card-title" style={{ margin: 0 }}>Solution</h3>
                <span className="solution-badge">✓ Found</span>
              </div>
              <ZipVisualizer
                matrix={matrix}
                solution={solution}
                hWalls={hWalls}
                vWalls={vWalls}
              />
            </>
          ) : (
            <div className="no-solution">
              <div className="no-solution-icon">🔍</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 6 }}>No solution found</div>
              <div style={{ fontSize: '0.85rem' }}>
                Check that all numbered cells are reachable and walls don't block the path.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
