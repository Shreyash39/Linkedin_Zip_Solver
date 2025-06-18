import React, { useRef, useState } from "react";
import Tesseract from "tesseract.js";

function preprocessImage(file, callback) {
  const img = new window.Image();
  const reader = new FileReader();
  reader.onload = function (e) {
    img.src = e.target.result;
    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      // Convert to grayscale & increase contrast
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < imageData.data.length; i += 4) {
        const avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3;
        // Increase contrast
        const contrast = 60; // Try 60-100 for more/less contrast
        let v = avg < 128 ? avg - contrast : avg + contrast;
        v = Math.max(0, Math.min(255, v));
        imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = v;
      }
      ctx.putImageData(imageData, 0, 0);
      canvas.toBlob(callback, "image/png");
    };
  };
  reader.readAsDataURL(file);
}

export default function ImageOCRInput({ onMatrixParsed }) {
  const [ocrText, setOcrText] = useState("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setProcessing(true);
    setOcrText("");
    setProgress(0);

    preprocessImage(file, async (blob) => {
      const { data } = await Tesseract.recognize(blob, "eng", {
        logger: m => {
          if (m.status === "recognizing text" && m.progress) setProgress(m.progress);
        },
      });
      setOcrText(data.text);
      setProcessing(false);
      setProgress(1);
    });
  }

  function handleApply() {
    if (!ocrText.trim()) return;
    onMatrixParsed(ocrText);
  }

  return (
    <div style={{margin: "16px 0", padding: "16px", border: "1px solid #eee", borderRadius: 8}}>
      <h4>Upload Image for OCR</h4>
      <input
        type="file"
        accept="image/*"
        onChange={handleFile}
        disabled={processing}
      />
      {processing && (
        <div>
          <div>Processing image…</div>
          <div style={{ width: "100%", height: 8, background: "#eee", borderRadius: 4 }}>
            <div style={{
              width: `${Math.round(progress * 100)}%`,
              height: 8,
              background: "#1ec7f7",
              borderRadius: 4,
              transition: "width 0.2s"
            }} />
          </div>
        </div>
      )}
      {ocrText && (
        <div>
          <h5>Extracted Text (edit if needed):</h5>
          <textarea
            style={{width: "100%", minHeight: 100, fontFamily: "monospace"}}
            value={ocrText}
            onChange={e => setOcrText(e.target.value)}
          />
          <button onClick={handleApply}>Apply to Puzzle</button>
        </div>
      )}
    </div>
  );
}