import React, { useRef, useState, useEffect } from "react";
import StickyNote from "./StickyNote";
import html2canvas from "html2canvas";

export default function DrawingBoard() {
  /* Refs */
  const canvasRef    = useRef(null);
  const ctxRef       = useRef(null);
  const boardRef     = useRef(null);           // wrapper for html2canvas

  /* Drawing state */
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor]         = useState("#000000");
  const [lineWidth, setLineWidth] = useState(4);
  const [tool, setTool]           = useState("pen");
  const [history, setHistory]     = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  /* Sticky‑note state */
  const [notes, setNotes] = useState([]);

  /* ---------- Canvas init ---------- */
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width  = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.8;

    const ctx = canvas.getContext("2d");
    ctx.lineCap     = "round";
    ctx.strokeStyle = color;
    ctx.lineWidth   = lineWidth;
    ctx.fillStyle   = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctxRef.current  = ctx;

    setHistory([canvas.toDataURL()]);
  }, []);

  /* ---------- Brush sync ---------- */
  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.strokeStyle = tool === "eraser" ? "#ffffff" : color;
      ctxRef.current.lineWidth   = lineWidth;
    }
  }, [color, tool, lineWidth]);

  /* ---------- Drawing handlers ---------- */
  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    ctxRef.current.beginPath();
    ctxRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = nativeEvent;
    ctxRef.current.lineTo(offsetX, offsetY);
    ctxRef.current.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const snapshot = canvasRef.current.toDataURL();
    setHistory((h) => [...h, snapshot]);
    setRedoStack([]);
  };

  /* ---------- Undo / Redo ---------- */
  const undo = () => {
    if (history.length <= 1) return;
    const newHist = [...history];
    const last    = newHist.pop();
    setHistory(newHist);
    setRedoStack((r) => [...r, last]);

    const img = new Image();
    img.src = newHist[newHist.length - 1];
    img.onload = () => {
      const ctx = ctxRef.current;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const redo = () => {
    if (!redoStack.length) return;
    const stack = [...redoStack];
    const next  = stack.pop();
    setRedoStack(stack);
    setHistory((h) => [...h, next]);

    const img = new Image();
    img.src = next;
    img.onload = () => {
      const ctx = ctxRef.current;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  /* ---------- Clear ---------- */
  const clearCanvas = () => {
    const ctx = ctxRef.current;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHistory([canvasRef.current.toDataURL()]);
    setRedoStack([]);
    setNotes([]);                      // clear notes too
  };

  /* ---------- Download (canvas + notes) ---------- */
  const downloadImage = async () => {
    if (!boardRef.current) return;
    const snapshot = await html2canvas(boardRef.current, { backgroundColor: null });
    const link = document.createElement("a");
    link.href = snapshot.toDataURL("image/png");
    link.download = "drawing_with_notes.png";
    link.click();
  };

  /* ---------- Save + Load (drawing + notes) ---------- */
  const saveBoard = () => {
    const boardData = {
      image: canvasRef.current.toDataURL("image/png"),
      notes,
    };
    localStorage.setItem("savedBoard", JSON.stringify(boardData));
    alert("Board saved!");
  };

  const loadBoard = () => {
    const data = localStorage.getItem("savedBoard");
    if (!data) return alert("No saved board found!");
    const { image, notes: savedNotes } = JSON.parse(data);

    const img = new Image();
    img.src = image;
    img.onload = () => {
      const ctx = ctxRef.current;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(img, 0, 0);
      setHistory([image]);             // reset history
      setRedoStack([]);
      setNotes(savedNotes || []);
    };
  };

  /* ---------- Sticky‑note helpers ---------- */
  const getRandomColor = () => {
    const pal = ["#fff475", "#f28b82", "#ccff90", "#a7ffeb", "#d7aefb", "#fdcfe8", "#aecbfa"];
    return pal[Math.floor(Math.random() * pal.length)];
  };

  const addNote = () =>
    setNotes((n) => [
      ...n,
      {
        id: Date.now(),
        x: 50,
        y: 50,
        width: 230,
        height: 150,
        text: "New note",
        color: getRandomColor(),
      },
    ]);

  const updateNote = (id, updates) =>
    setNotes((n) => n.map((note) => (note.id === id ? { ...note, ...updates } : note)));

  const deleteNote = (id) => setNotes((n) => n.filter((note) => note.id !== id));

  /* ---------- Style helper ---------- */
  const btn = (active = false) => ({
    padding: "10px 16px",
    margin: "4px",
    borderRadius: "8px",
    border: active ? "2px solid #333" : "1px solid #ccc",
    background: active ? "#f0f0f0" : "#fff",
    cursor: "pointer",
    fontWeight: "bold",
  });

  /* ---------- Render ---------- */
  return (
    <div style={{ fontFamily: "sans-serif", padding: 20 }}>
      <h2 style={{ textAlign: "center", marginTop: 0 }}>🎨 Drawing Board</h2>

      {/* Toolbar */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems:'center', marginBottom: 16 }}>
        <button style={btn(tool === "pen")}    onClick={() => setTool("pen")}>✏️ Pen</button>
        <button style={btn(tool === "eraser")} onClick={() => setTool("eraser")}>🧽 Eraser</button>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ margin: 4 }} />
        <input type="range" min="1" max="30" value={lineWidth} onChange={(e) => setLineWidth(+e.target.value)} />
        <button style={btn()} onClick={undo}>↩️ Undo</button>
        <button style={btn()} onClick={redo}>↪️ Redo</button>
        <button style={btn()} onClick={clearCanvas}>🗑️ Clear</button>
        <button style={btn()} onClick={downloadImage}>💾 Download</button>
        <button style={btn()} onClick={saveBoard}>📥 Save</button>
        <button style={btn()} onClick={loadBoard}>📤 Load</button>
        <button style={btn()} onClick={addNote}>➕ Add Note</button>
      </div>

      {/* Board container */}
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div ref={boardRef} style={{ position: "relative", display: "inline-block" }}>
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            style={{ border: "2px solid black", borderRadius: 10, background: "#ffffff" }}
          />
          {notes.map((note) => (
            <StickyNote key={note.id} note={note} onUpdate={updateNote} onDelete={deleteNote} />
          ))}
        </div>
      </div>
    </div>
  );
}
