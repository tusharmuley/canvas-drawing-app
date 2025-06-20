/* DrawingBoard.js — React + Django‑Channels realtime board */

import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StickyNote from "./StickyNote";
import html2canvas from "html2canvas";
import { logout } from "../services/auth";
import { v4 as uuidv4 } from "uuid";



import Projects from "../pages/Projects";
// import api from "../services/api";                 // axios wrapper

const USER_NAME = `User-${Math.floor(Math.random() * 1000)}`; // demo

export default function DrawingBoard({ slug, initial, projectName  }) {
  // console.log('initianl',slug, initial)
  /* refs */
  const canvasRef  = useRef(null);
  const ctxRef     = useRef(null);
  const boardRef   = useRef(null);
  const strokeBuf  = useRef([]);
  const socketRef  = useRef(null);

  const nav = useNavigate();

  /* state */
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor]         = useState("#000000");
  const [lineWidth, setLineWidth] = useState(4);
  const [tool, setTool]           = useState("pen");
  const [history, setHistory]     = useState([]);
  const [redoStack, setRedo]      = useState([]);
  const [notes, setNotes]         = useState(initial.notes || []);
  const [showModal, setShowModal] = useState(false);

  /* canvas init */
  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width  = window.innerWidth * 0.9;
    canvas.height = window.innerHeight * 0.8;
    const ctx     = canvas.getContext("2d");
    ctx.lineCap   = "round";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctxRef.current = ctx;
    setHistory([canvas.toDataURL()]);
  }, []);

  /* brush sync */
  useEffect(() => {
    if (ctxRef.current) {
      ctxRef.current.lineWidth   = lineWidth;
      ctxRef.current.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    }
  }, [color, tool, lineWidth]);

  /* preload strokes */
  useEffect(() => {
    initial.events.forEach((e) => replayStroke(e));
  }, [initial]);

  /* websocket connect */
  useEffect(() => {
    const token  = localStorage.getItem("access_token");
    const wsURL  = `ws://localhost:8000/ws/board/${slug}/?token=${token}`;
    const socket = new WebSocket(wsURL);
    socketRef.current = socket;

    socket.onmessage = (evt) => {
      const data = JSON.parse(evt.data);
      if (data.type === "draw")      replayStroke(data);
      else if (data.type === "note") handleNote(data);
    };

    return () => socket.close();
  }, [slug]);

  /* helpers */
  const sendWS = (obj) => socketRef.current?.readyState === 1 && socketRef.current.send(JSON.stringify(obj));

  const handleNote = ({ action, note }) => {
    if (action === "create")  setNotes((p) => [...p, note]);
    if (action === "update")  setNotes((p) => p.map((n) => (n.id === note.id ? note : n)));
    if (action === "delete")  setNotes((p) => p.filter((n) => n.id !== note.id));
  };

  /* drawing handlers */
  const startDraw = ({ nativeEvent:{offsetX:x, offsetY:y} }) => {
    ctxRef.current.beginPath(); ctxRef.current.moveTo(x, y);
    setIsDrawing(true); strokeBuf.current = [{x,y}];
  };
  const draw = ({ nativeEvent:{offsetX:x, offsetY:y} }) => {
    if (!isDrawing) return;
    ctxRef.current.lineTo(x, y); ctxRef.current.stroke();
    strokeBuf.current.push({x,y});
  };
  const stopDraw = () => {
    if (!isDrawing) return; setIsDrawing(false);
    setHistory((h)=>[...h, canvasRef.current.toDataURL()]); setRedo([]);
    if (strokeBuf.current.length>1) sendWS({type:"draw",tool,color,line_width:lineWidth,points:strokeBuf.current,username:USER_NAME});
  };

  const replayStroke = ({ tool:t,color:c,line_width:lw,points }) => {
    if (!points?.length) return;
    const ctx = ctxRef.current; ctx.save();
    ctx.lineWidth=lw; ctx.strokeStyle = t==="eraser"?"#ffffff":c;
    ctx.beginPath(); ctx.moveTo(points[0].x,points[0].y);
    points.slice(1).forEach(p=>ctx.lineTo(p.x,p.y)); ctx.stroke(); ctx.restore();
  };

  /* undo/redo */
  const undo = () => {
    if (history.length<=1) return;
    const h=[...history]; const last=h.pop(); setHistory(h); setRedo((r)=>[...r,last]);
    const img=new Image(); img.src=h[h.length-1]; img.onload=()=>{ctxRef.current.clearRect(0,0,canvasRef.current.width,canvasRef.current.height);ctxRef.current.drawImage(img,0,0);}
  };
  const redo = () => {
    if (!redoStack.length) return;
    const r=[...redoStack]; const next=r.pop(); setRedo(r); setHistory((h)=>[...h,next]);
    const img=new Image(); img.src=next; img.onload=()=>{ctxRef.current.clearRect(0,0,canvasRef.current.width,canvasRef.current.height);ctxRef.current.drawImage(img,0,0);}
  };

  // for logout 
  const handlelogout = () => {
    logout();
    nav("/login");
  
  }

  /* note ops */
  const palette = ["#fff475","#f28b82","#ccff90","#a7ffeb","#d7aefb","#fdcfe8","#aecbfa"];
  const randCol = ()=>palette[Math.floor(Math.random()*palette.length)];
  const addNote   = ()=> sendWS({type:"note",action:"create",note:{id:uuidv4(),x:50,y:50,width:230,height:150,text:"New note",color:randCol()}});
  const updateNote= (id,upd)=> sendWS({type:"note",action:"update",note:{id,...upd}});
  const delNote   = (id)=>     sendWS({type:"note",action:"delete",note:{id}});

  /* misc */
  const clearCanvas = () => {ctxRef.current.fillStyle="#ffffff";ctxRef.current.fillRect(0,0,canvasRef.current.width,canvasRef.current.height);setHistory([canvasRef.current.toDataURL()]);setRedo([]);}
  const dlImg = async()=>{const snap=await html2canvas(boardRef.current,{backgroundColor:null});const a=document.createElement("a");a.href=snap.toDataURL("image/png");a.download=`board-${slug}.png`;a.click();}
  const btn = (act=false)=>({padding:"10px 16px",margin:4,borderRadius:8,border:act?"2px solid #333":"1px solid #ccc",background:act?"#f0f0f0":"#fff",cursor:"pointer",fontWeight:"bold"});
  const btn1 = (act=false)=>({padding:"10px 16px",margin:4,borderRadius:8,border:act?"2px solid #333":"1px solid #ccc",cursor:"pointer",fontWeight:"bold"});

  return (
    <div style={{fontFamily:"sans-serif",padding:20}}>
      <h2 style={{textAlign:"center",marginTop:0}}>🎨 Drawing Board: {projectName}</h2>
      <div className="container d-flex justify-content-end">
        <button style={btn()} onClick={()=>setShowModal(true)}>Projects</button>
        <button style={btn1()} className="btn btn-danger" onClick={handlelogout}>Logout</button>
      </div>
      
      {/* Modal */}
        {showModal && (
          <div style={{
            position: "fixed",
            top: 0, left: 0,
            width: "100%", height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999
          }}>
            <div style={{
              background: "white",
              padding: 20,
              borderRadius: 8,
              maxHeight: "80%",
              overflowY: "auto",
              width: "90%",
              maxWidth: "500px",
              position: "relative"
            }}>
              <button onClick={() => setShowModal(false)} style={{
                position: "absolute", top: 10, right: 10, background: "red", color: "white", border: "none", borderRadius: 4, cursor: "pointer"
              }}>✖</button>
              <Projects />
            </div>
          </div>
        )}

      {/* toolbar */}
      <div className="container" style={{display:"flex",flexWrap:"wrap",alignItems:"center",marginBottom:16}}>
        <button style={btn(tool==="pen")}    onClick={()=>setTool("pen")}>✏️ Pen</button>
        <button style={btn(tool==="eraser")} onClick={()=>setTool("eraser")}>🧽 Eraser</button>
        <input type="color" value={color} onChange={(e)=>setColor(e.target.value)} style={{margin:4}} />
        <input type="range" min="1" max="30" value={lineWidth} onChange={(e)=>setLineWidth(+e.target.value)} />
        <button style={btn()} onClick={undo}>↩️ Undo</button>
        <button style={btn()} onClick={redo}>↪️ Redo</button>
        <button style={btn()} onClick={clearCanvas}>🗑️ Clear</button>
        <button style={btn()} onClick={dlImg}>💾 Download</button>
        <button style={btn()} onClick={addNote}>➕ Add Note</button>
      </div>

      {/* board */}
      <div className="container" style={{display:"flex",justifyContent:"center"}}>
        <div ref={boardRef} style={{position:"relative",display:"inline-block"}}>
          <canvas
            ref={canvasRef}
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={stopDraw}
            onMouseLeave={stopDraw}
            style={{border:"2px solid black",borderRadius:10,background:"#ffffff"}}
          />
          {notes.map((n)=><StickyNote key={n.id} note={n} onUpdate={updateNote} onDelete={delNote}/>)}
        </div>
      </div>
    </div>
  );
}
