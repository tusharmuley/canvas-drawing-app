// StickyNote.js — fixed: keep full note data on update so position doesn’t reset

import React, { useRef, useEffect, useState } from "react";
import "./StickyNote.css";

export default function StickyNote({ note, onUpdate, onDelete }) {
  const noteRef = useRef(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [tempText, setTempText] = useState(note.text);

  /* helper to send full merged note object */
  const emitUpdate = (partial) => {
    onUpdate(note.id, { ...note, ...partial });
  };

  /* Debounced text save */
  useEffect(() => {
    const t = setTimeout(() => {
      if (tempText !== note.text) emitUpdate({ text: tempText });
    }, 500);
    return () => clearTimeout(t);
  }, [tempText]);

  /* Sync external changes */
  useEffect(() => setTempText(note.text), [note.text]);

  /* Drag */
  const startDrag = (e) => {
    if (e.target.tagName === "TEXTAREA" || e.target.className === "resize-handle") return;
    document.body.classList.add("no-select");
    dragOffset.current = { x: e.clientX - note.x, y: e.clientY - note.y };
    window.addEventListener("mousemove", onDrag);
    window.addEventListener("mouseup", stopDrag);
  };
  const onDrag = (e) => emitUpdate({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y });
  const stopDrag = () => {
    window.removeEventListener("mousemove", onDrag);
    window.removeEventListener("mouseup", stopDrag);
    document.body.classList.remove("no-select");
  };

  /* Resize */
  const startResize = (e) => {
    document.body.classList.add("no-select");
    e.stopPropagation();
    window.addEventListener("mousemove", onResize);
    window.addEventListener("mouseup", stopResize);
  };
  const onResize = (e) => {
    const rect = noteRef.current.getBoundingClientRect();
    emitUpdate({ width: Math.max(100, e.clientX - rect.left), height: Math.max(100, e.clientY - rect.top) });
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
        position: "absolute",
        left: note.x,
        top: note.y,
        width: note.width,
        height: note.height,
        background: note.color || "#fff475",
      }}
      onMouseDown={startDrag}
    >
      <button className="delete-btn" onClick={() => onDelete(note.id)}>×</button>
      <textarea
        value={tempText}
        onChange={(e) => setTempText(e.target.value)}
        style={{ width: "100%", height: "calc(100% - 20px)", resize: "none", border: "none", background: "transparent", outline: "none", fontSize: 14 }}
      />
      <div className="resize-handle" onMouseDown={startResize}></div>
    </div>
  );
}
