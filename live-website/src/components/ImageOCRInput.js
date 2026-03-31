import React, { useRef, useState, useCallback } from "react";
import Tesseract from "tesseract.js";

// ─── Preprocess: upscale + grayscale + threshold ─────────────
function preprocessImage(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        // Upscale 2x for better OCR
        const scale = 2;
        const canvas = document.createElement("canvas");
        canvas.width  = img.width  * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Grayscale + high-contrast threshold
        const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < data.data.length; i += 4) {
          const gray = 0.299 * data.data[i] + 0.587 * data.data[i+1] + 0.114 * data.data[i+2];
          const val = gray > 140 ? 255 : 0;   // binary threshold
          data.data[i] = data.data[i+1] = data.data[i+2] = val;
        }
        ctx.putImageData(data, 0, 0);
        canvas.toBlob(resolve, "image/png");
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}

// ─── Parse OCR text → 2D matrix ─────────────────────────────
// Strategy: split by newlines, parse numbers from each line,
// keep lines that contain at least one number.
function parseOCRText(text, rows, cols) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  const gridRows = lines
    .map(line => {
      const tokens = line.split(/[\s,;|]+/);
      return tokens.map(t => {
        const n = parseInt(t.replace(/[^\d-]/g, ''), 10);
        return isNaN(n) ? -1 : n;
      });
    })
    .filter(row => row.some(v => v > 0)); // only rows with actual numbers

  // Build the matrix, clamped to [rows x cols]
  const matrix = Array.from({ length: rows }, () => Array(cols).fill(-1));
  gridRows.slice(0, rows).forEach((row, r) => {
    row.slice(0, cols).forEach((val, c) => {
      if (val > 0) matrix[r][c] = val;
    });
  });
  return matrix;
}

// ─── Component ───────────────────────────────────────────────
export default function ImageOCRInput({ onApply }) {
  const fileRef  = useRef();
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress]     = useState(0);
  const [stage, setStage]           = useState('');
  const [rawText, setRawText]       = useState('');
  const [previewMatrix, setPreviewMatrix] = useState(null); // 2D array
  const [previewRows, setPreviewRows]     = useState(6);
  const [previewCols, setPreviewCols]     = useState(6);
  const [dragOver, setDragOver]     = useState(false);

  // ── Run OCR on a file ────────────────────────────────────
  const runOCR = useCallback(async (file) => {
    if (!file || !file.type.startsWith('image/')) return;
    setProcessing(true);
    setRawText('');
    setPreviewMatrix(null);
    setProgress(0);
    setStage('Preprocessing image…');

    const blob = await preprocessImage(file);

    setStage('Running OCR…');
    const { data } = await Tesseract.recognize(blob, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          setProgress(m.progress || 0);
        }
      },
    });
    const text = data.text;
    setRawText(text);
    setStage('');
    setProcessing(false);
    setProgress(1);

    // Auto-parse into preview
    const parsed = parseOCRText(text, previewRows, previewCols);
    setPreviewMatrix(parsed);
  }, [previewRows, previewCols]);

  function handleFileInput(e) {
    const f = e.target.files[0];
    if (f) runOCR(f);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) runOCR(f);
  }

  // ── Re-parse when rows/cols change ───────────────────────
  function reparseWithSize(r, c) {
    if (!rawText) return;
    const parsed = parseOCRText(rawText, r, c);
    setPreviewMatrix(parsed);
  }

  function handleRowsChange(r) {
    setPreviewRows(r);
    reparseWithSize(r, previewCols);
  }

  function handleColsChange(c) {
    setPreviewCols(c);
    reparseWithSize(previewRows, c);
  }

  // ── Edit a cell in the preview grid ──────────────────────
  function handlePreviewCellEdit(r, c, val) {
    const n = val === '' ? -1 : parseInt(val, 10);
    setPreviewMatrix(prev =>
      prev.map((row, i) =>
        i === r ? row.map((v, j) => (j === c ? (isNaN(n) ? -1 : n) : v)) : row
      )
    );
  }

  // ── Apply to main puzzle ──────────────────────────────────
  function handleApply() {
    if (!previewMatrix) return;
    onApply(previewMatrix, previewRows, previewCols);
  }

  return (
    <div>
      {/* ── Drop zone ─────────────────────────────────────── */}
      <div
        className={`ocr-dropzone${dragOver ? ' drag-over' : ''}`}
        onClick={() => fileRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <div className="ocr-drop-icon">📷</div>
        <div className="ocr-drop-main">Drop a puzzle screenshot here</div>
        <div className="ocr-drop-sub">
          or <strong>click to upload</strong> — PNG, JPG, WEBP
        </div>
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileInput}
      />

      {/* ── Progress ──────────────────────────────────────── */}
      {processing && (
        <div className="ocr-progress-wrap">
          <div className="ocr-progress-label">
            <span>{stage}</span>
            <span>{Math.round(progress * 100)}%</span>
          </div>
          <div className="ocr-progress-track">
            <div className="ocr-progress-fill" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
      )}

      {/* ── OCR result + preview grid ─────────────────────── */}
      {previewMatrix && (
        <div className="ocr-result">
          <div className="ocr-result-title">
            OCR Result Preview
            <span className="badge-warning">Review &amp; fix before applying</span>
          </div>

          {/* Size controls */}
          <div style={{ display: 'flex', gap: 20, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: '#666', fontWeight: 600 }}>Grid size:</span>
            {[['Rows', previewRows, handleRowsChange], ['Cols', previewCols, handleColsChange]].map(
              ([label, val, setter]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.8rem', color: '#888' }}>{label}</span>
                  <div className="size-stepper">
                    <button className="size-step-btn"
                      onClick={() => setter(Math.max(2, val - 1))}>−</button>
                    <div className="size-value">{val}</div>
                    <button className="size-step-btn"
                      onClick={() => setter(Math.min(12, val + 1))}>+</button>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Editable preview grid */}
          <div
            className="ocr-grid-preview"
            style={{ gridTemplateColumns: `repeat(${previewCols}, 38px)` }}
          >
            {previewMatrix.map((row, r) =>
              row.map((val, c) => (
                <input
                  key={`${r}-${c}`}
                  className={`ocr-grid-cell${val !== -1 ? ' has-num' : ''}`}
                  type="number"
                  value={val === -1 ? '' : val}
                  placeholder="—"
                  onChange={(e) => handlePreviewCellEdit(r, c, e.target.value)}
                  style={{
                    border: '1.5px solid',
                    borderColor: val !== -1 ? '#93c5fd' : '#e5e7eb',
                    borderRadius: 6,
                    width: 38, height: 38,
                    textAlign: 'center',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    fontFamily: "'IBM Plex Mono', monospace",
                    background: val !== -1 ? '#eff6ff' : '#fff',
                    color: val !== -1 ? '#1d4ed8' : '#ccc',
                    outline: 'none',
                    MozAppearance: 'textfield',
                    padding: 0,
                    cursor: 'text',
                  }}
                />
              ))
            )}
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={handleApply}>
              ✓ Apply to Puzzle
            </button>
            <button className="btn-secondary" onClick={() => {
              setPreviewMatrix(null); setRawText('');
            }}>
              Discard
            </button>
          </div>

          {/* Raw text accordion */}
          <details style={{ marginTop: 14 }}>
            <summary style={{ fontSize: '0.78rem', color: '#888', cursor: 'pointer' }}>
              Raw OCR text (click to expand)
            </summary>
            <textarea
              style={{
                width: '100%', minHeight: 80, marginTop: 8,
                fontFamily: "'IBM Plex Mono', monospace", fontSize: '0.75rem',
                border: '1px solid #e5e7eb', borderRadius: 8, padding: '8px 10px',
                color: '#555', background: '#fafafa', resize: 'vertical',
              }}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                setPreviewMatrix(parseOCRText(e.target.value, previewRows, previewCols));
              }}
            />
          </details>
        </div>
      )}
    </div>
  );
}
