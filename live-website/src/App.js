import React, { useRef, useState, useCallback } from 'react';
import MatrixInput from './components/MatrixInput';
import ZipVisualizer from './components/ZipVisualizer';
import solveZipPuzzle from './solver';
import ImageOCRInput from './components/ImageOCRInput';

function make2D(rows, cols, val) {
  return Array.from({ length: rows }, () => Array(cols).fill(val));
}

export default function App() {
  const [rows, setRows] = useState(7);
  const [cols, setCols] = useState(7);

  const [matrix, setMatrix] = useState(make2D(7, 7, -1));
  const [hWalls, setHWalls] = useState(make2D(7, 7, 0));
  const [vWalls, setVWalls] = useState(make2D(7, 7, 0));
  const [solution, setSolution] = useState(null);
  const [error, setError] = useState(null);

  // When grid size changes, resize matrices
  React.useEffect(() => {
    setMatrix(prev =>
      prev.length === rows && prev[0].length === cols
        ? prev
        : make2D(rows, cols, -1)
    );
    setHWalls(prev =>
      prev.length === rows && prev[0].length === cols
        ? prev
        : make2D(rows, cols, 0)
    );
    setVWalls(prev =>
      prev.length === rows && prev[0].length === cols
        ? prev
        : make2D(rows, cols, 0)
    );
  }, [rows, cols]);

  function handleSolve() {
    try {
      const matrixCopy = matrix.map(row => row.slice());
      const hWallsCopy = hWalls.map(row => row.slice());
      const vWallsCopy = vWalls.map(row => row.slice());
      const result = solveZipPuzzle(matrixCopy, hWallsCopy, vWallsCopy);
      setSolution(result);
      setError(null);
    } catch (e) {
      setError(e.message);
      setSolution(null);
    }
  }

  // Reuse the paste parser from MatrixInput via ref
  const matrixInputRef = useRef();

  // This lets you apply the OCR'd text as if pasted manually
  const handleMatrixParsed = useCallback((pastedText) => {
    if (matrixInputRef.current && typeof matrixInputRef.current.parseBulkPaste === "function") {
      matrixInputRef.current.parseBulkPaste(pastedText);
    }
  }, []);

  return (
    <div style={{padding: 24}}>
      <h1>LinkedIn Zip Solver</h1>
      <ImageOCRInput onMatrixParsed={handleMatrixParsed} />
      <MatrixInput
        ref={matrixInputRef}
        matrix={matrix}
        setMatrix={setMatrix}
        hWalls={hWalls}
        setHWalls={setHWalls}
        vWalls={vWalls}
        setVWalls={setVWalls}
        rows={rows}
        setRows={setRows}
        cols={cols}
        setCols={setCols}
      />
      <button onClick={handleSolve} style={{margin: "12px 0"}}>Solve Puzzle</button>
      {error && <div style={{color: "red"}}>{error}</div>}
      {solution && solution.length > 0 && (
        <div>
          <h3>Solution Visualization:</h3>
          <ZipVisualizer matrix={matrix} solution={solution} />
        </div>
      )}
      {solution && solution.length === 0 && <div>No solution found.</div>}
    </div>
  );
}