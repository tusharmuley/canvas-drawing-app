import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";

export default function Login() {
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const handle = async () => {
    try {
      await login(username, password);
      nav("/projects");
    } catch {
      setErr("Invalid credentials");
    }
  };

  return (
    <div style={{ maxWidth: 320, margin: "auto", padding: 20 }}>
      <h3>Login</h3>
      {err && <p style={{ color: "red" }}>{err}</p>}
      <input placeholder="user" value={username} onChange={(e) => setU(e.target.value)} /><br />
      <input type="password" placeholder="pass" value={password} onChange={(e) => setP(e.target.value)} /><br />
      <button onClick={handle}>Login</button>
    </div>
  );
}
