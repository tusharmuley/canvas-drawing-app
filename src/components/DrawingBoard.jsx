import React, { useRef, useState, useEffect } from 'react';

export default function DrawingBoard() {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(4);
  const [tool, setTool] = useState('pen');

  const [history, setHistory] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 0.8;
    canvas.height = window.innerHeight * 0.6;
    const ctx = canvas.getContext('2d');
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctxRef.current = ctx;

    const initialSnapshot = canvas.toDataURL();
    setHistory([initialSnapshot]);
  }, []);

  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
      ctxRef.current.lineWidth = lineWidth;
    }
  }, [color, tool, lineWidth]);

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
    const canvas = canvasRef.current;
    const snapshot = canvas.toDataURL();
    setHistory((prev) => [...prev, snapshot]);
    setRedoStack([]);
  };

  const undo = () => {
    if (history.length <= 1) return;
    const newHistory = [...history];
    const lastSnapshot = newHistory.pop();
    setHistory(newHistory);
    setRedoStack((prev) => [...prev, lastSnapshot]);
    const img = new Image();
    img.src = newHistory[newHistory.length - 1];
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = ctxRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const newRedoStack = [...redoStack];
    const nextSnapshot = newRedoStack.pop();
    setRedoStack(newRedoStack);
    setHistory((prev) => [...prev, nextSnapshot]);
    const img = new Image();
    img.src = nextSnapshot;
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = ctxRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    ctxRef.current.clearRect(0, 0, canvas.width, canvas.height);
    ctxRef.current.fillStyle = '#ffffff';
    ctxRef.current.fillRect(0, 0, canvas.width, canvas.height);
    const snapshot = canvas.toDataURL();
    setHistory([snapshot]);
    setRedoStack([]);
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = 'my_drawing.png';
    link.click();
  };

  const saveToLocalStorage = () => {
    const canvas = canvasRef.current;
    const image = canvas.toDataURL('image/png');
    localStorage.setItem('savedDrawing', image);
    alert('Drawing saved locally!');
  };

  const loadFromLocalStorage = () => {
    const saved = localStorage.getItem('savedDrawing');
    if (!saved) {
      alert('No saved drawing found!');
      return;
    }
    const img = new Image();
    img.src = saved;
    img.onload = () => {
      const canvas = canvasRef.current;
      const ctx = ctxRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      const snapshot = canvas.toDataURL();
      setHistory((prev) => [...prev, snapshot]);
    };
  };

  const buttonStyle = (active) => ({
    padding: '10px 16px',
    margin: '4px',
    borderRadius: '8px',
    border: active ? '2px solid #333' : '1px solid #ccc',
    backgroundColor: active ? '#f0f0f0' : '#fff',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    transition: '0.2s',
  });

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 20 }}>
      <h2 style={{ textAlign: 'center' }}>🎨 Drawing Board</h2>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center',alignItems:'center', marginBottom: 16 }}>
        <button style={buttonStyle(tool === 'pen')} onClick={() => setTool('pen')}>✏️ Pen</button>
        <button style={buttonStyle(tool === 'eraser')} onClick={() => setTool('eraser')}>🧽 Eraser</button>
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ margin: 4 }} />
        <input type="range" min="1" max="30" value={lineWidth} onChange={(e) => setLineWidth(parseInt(e.target.value))} />
        <button style={buttonStyle()} onClick={undo}>↩️ Undo</button>
        <button style={buttonStyle()} onClick={redo}>↪️ Redo</button>
        <button style={buttonStyle()} onClick={clearCanvas}>🗑️ Clear</button>
        <button style={buttonStyle()} onClick={downloadImage}>💾 Download</button>
        <button style={buttonStyle()} onClick={saveToLocalStorage}>📥 Save</button>
        <button style={buttonStyle()} onClick={loadFromLocalStorage}>📤 Load</button>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          style={{ border: '2px solid black', borderRadius: 10, backgroundColor: '#ffffff' }}
        />
      </div>
    </div>
  );
}
