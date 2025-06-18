import React, { useRef, useImperativeHandle, forwardRef } from "react";

const MatrixInput = forwardRef(({
  matrix, setMatrix,
  hWalls, setHWalls,
  vWalls, setVWalls,
  rows, setRows,
  cols, setCols
}, ref) => {
  const pasteRef = useRef();

  // Helper to update a value in a 2D array immutably
  function update2D(arr, r, c, val) {
    return arr.map((row, i) =>
      i === r ? row.map((cell, j) => (j === c ? val : cell)) : row
    );
  }

  function handleMatrixChange(r, c, val) {
    let numVal = val === "" ? -1 : parseInt(val, 10);
    if (isNaN(numVal)) numVal = -1;
    setMatrix(update2D(matrix, r, c, numVal));
  }
  function handleHWallsChange(r, c, val) {
    let numVal = val === "" ? 0 : parseInt(val, 10);
    if (isNaN(numVal) || numVal !== 1) numVal = 0;
    setHWalls(update2D(hWalls, r, c, numVal));
  }
  function handleVWallsChange(r, c, val) {
    let numVal = val === "" ? 0 : parseInt(val, 10);
    if (isNaN(numVal) || numVal !== 1) numVal = 0;
    setVWalls(update2D(vWalls, r, c, numVal));
  }

  // Expose parseBulkPaste to parent via ref
  useImperativeHandle(ref, () => ({
    parseBulkPaste: (text) => {
      if (pasteRef.current) pasteRef.current.value = text;
      handleBulkPaste(text);
    }
  }));

  function handleBulkPaste(externalText) {
    const text = externalText !== undefined
      ? externalText
      : pasteRef.current.value;
    const lines = text.trim().split('\n').map(line => line.trim());
    if (lines.length < 1) {
      alert("Paste input is empty.");
      return;
    }
    // Parse m and n
    const sizeLine = lines[0].split(/\s+/);
    if (sizeLine.length < 2) {
      alert("First line must be 'm n' (rows cols).");
      return;
    }
    const m = parseInt(sizeLine[0], 10);
    const n = parseInt(sizeLine[1], 10);
    if (isNaN(m) || isNaN(n) || m < 1 || n < 1) {
      alert("Failed to read m and n from the first line.");
      return;
    }
    // Now parse the three matrices
    // Find blank lines (or lines that are all whitespace)
    let blocks = [];
    let curr = [];
    for (let i = 1; i < lines.length; ++i) {
      if (lines[i] === "") {
        if (curr.length) {
          blocks.push(curr);
          curr = [];
        }
      } else {
        curr.push(lines[i]);
      }
    }
    if (curr.length) blocks.push(curr);
    if (blocks.length < 3) {
      alert("Please paste all three matrices (numbers, horizontal walls, vertical walls) after the first line, separated by blank lines.");
      return;
    }
    // Now parse each block
    function parseBlock(block) {
      return block.map(line =>
        line.split(/\s+/).map(s => {
          const v = parseInt(s, 10);
          return isNaN(v) ? -1 : v;
        })
      );
    }
    const numMat = parseBlock(blocks[0]);
    const hMat = parseBlock(blocks[1]);
    const vMat = parseBlock(blocks[2]);
    // Validate matrix sizes
    if (
      numMat.length !== m || !numMat.every(row => row.length === n) ||
      hMat.length !== m || !hMat.every(row => row.length === n) ||
      vMat.length !== m || !vMat.every(row => row.length === n)
    ) {
      alert(`All matrices must be exactly ${m} rows × ${n} columns.`);
      return;
    }
    setRows(m);
    setCols(n);
    setMatrix(numMat);
    setHWalls(hMat);
    setVWalls(vMat);
  }

  function renderGrid(arr, onChange, placeholder = "", min = undefined, max = undefined) {
    return (
      <table>
        <tbody>
          {arr.map((row, r) => (
            <tr key={r}>
              {row.map((cell, c) => (
                <td key={c}>
                  <input
                    style={{ width: "2.5em", textAlign: "center" }}
                    type="number"
                    value={cell === -1 ? "" : cell}
                    min={min}
                    max={max}
                    placeholder={placeholder}
                    onChange={e => onChange(r, c, e.target.value)}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  return (
    <div>
      <h3>Paste All Matrices (m n, Numbers, Horizontal Walls, Vertical Walls)</h3>
      <textarea
        ref={pasteRef}
        rows={Math.max(rows * 3, 15)}
        cols={Math.max(cols * 3, 40)}
        placeholder={
          "First line: m n (rows cols)\nNumbers matrix\n(blank line)\nHorizontal walls\n(blank line)\nVertical walls\nEach matrix: rows of space-separated numbers."
        }
        style={{width: "100%", fontFamily: "monospace"}}
      />
      <br />
      <button onClick={() => handleBulkPaste()}>Parse Pasted Matrices</button>
      <p>
        <b>Instructions:</b> First line should be <code>m n</code> (rows cols). Then paste the numbers, horizontal walls, and vertical walls, <b>each separated by a blank line</b>.<br/>
        Each matrix should be m rows by n columns. You can still edit by cell below after parsing.
      </p>
      <h4>Numbers Matrix (use -1 for blank)</h4>
      {renderGrid(matrix, handleMatrixChange, "-1 = blank")}
      <h4>Horizontal Walls (1=block, 0=open)</h4>
      {renderGrid(hWalls, handleHWallsChange, "0/1", 0, 1)}
      <h4>Vertical Walls (1=block, 0=open)</h4>
      {renderGrid(vWalls, handleVWallsChange, "0/1", 0, 1)}
    </div>
  );
});

export default MatrixInput;