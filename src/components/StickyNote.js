import React, { useRef, useEffect, useState } from "react";
import "./StickyNote.css";

function StickyNote({ note, onUpdate, onDelete }) {
  const noteRef = useRef(null);
  const offset = useRef({ x: 0, y: 0 });
  const [tempText, setTempText] = useState(note.text);

  // Debounced auto-save
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (tempText !== note.text) {
        onUpdate(note.id, { text: tempText });
      }
    }, 1000);
    return () => clearTimeout(timeout);
  }, [tempText]);

  // Sync text if changed externally
  useEffect(() => {
    setTempText(note.text);
  }, [note.text]);

  // Drag Handlers
  const startDrag = (e) => {
    if (e.target.tagName === "TEXTAREA" || e.target.className === "resize-handle") return;
    document.body.classList.add("no-select");
    offset.current = {
      x: e.clientX - note.x,
      y: e.clientY - note.y,
    };
    window.addEventListener("mousemove", onDrag);
    window.addEventListener("mouseup", stopDrag);
  };

  const onDrag = (e) => {
    onUpdate(note.id, {
      x: e.clientX - offset.current.x,
      y: e.clientY - offset.current.y,
    });
  };

  const stopDrag = () => {
    window.removeEventListener("mousemove", onDrag);
    window.removeEventListener("mouseup", stopDrag);
    document.body.classList.remove("no-select");
  };

  // Resize Handlers
  const startResize = (e) => {
    document.body.classList.add("no-select");
    e.stopPropagation();
    window.addEventListener("mousemove", onResize);
    window.addEventListener("mouseup", stopResize);
  };

  const onResize = (e) => {
    const rect = noteRef.current.getBoundingClientRect();
    onUpdate(note.id, {
      width: Math.max(100, e.clientX - rect.left),
      height: Math.max(100, e.clientY - rect.top),
    });
  };

  const stopResize = () => {
    window.removeEventListener("mousemove", onResize);
    window.removeEventListener("mouseup", stopResize);
    document.body.classList.remove("no-select");
  };

  return (
    <div
      ref={noteRef}
      className="sticky-note"
      style={{
        left: note.x,
        top: note.y,
        width: note.width,
        height: note.height,
        background: note.color || "#fff475",
      }}
      onMouseDown={startDrag}
    >
      {/* ❌ Delete Button */}
      <button className="delete-btn" onClick={() => onDelete(note.id)}>×</button>

      {/* 🕒 Timestamp */}
      {/* <div className="note-timestamp">
        <div>🕒 Created: {new Date(note.createdAt).toLocaleString()}</div>
        <div>✏️ Edited: {new Date(note.updatedAt).toLocaleString()}</div>
      </div> */}

      {/* 📝 Textarea */}
      <textarea value={tempText} onChange={(e) => setTempText(e.target.value)} />

      {/* ↔️ Resize Handle */}
      <div className="resize-handle" onMouseDown={startResize}></div>
    </div>
  );
}

export default StickyNote;
