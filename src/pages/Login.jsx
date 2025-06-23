import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/auth";

export default function Login() {
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [err, setErr] = useState("");
  const nav = useNavigate();

  const handle = async (e) => {
    e.preventDefault(); // ✅ Prevent page reload
    try {
      await login(username, password);
      nav("/projects");
      window.location.reload(); // ✅ Add this
    } catch {
      setErr("Invalid credentials");
    }
  };

  return (
    <div style={styles.container}>
      <h2>Login</h2>
      <form style={styles.form} onSubmit={handle}>
        <input
          name="username"
          placeholder="Username"
          value={username}
          onChange={(e) => setU(e.target.value)}
          required
          style={styles.input}
        />
        <input
          name="password"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setP(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Login</button>
        {err && <p style={styles.error}>{err}</p>}
      </form>
      <p>
        Not have an account? <a href="/signup">Signup here</a>
      </p>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 400,
    margin: "80px auto",
    padding: 20,
    border: "1px solid #ccc",
    borderRadius: 10,
    textAlign: "center",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  input: {
    padding: 10,
    fontSize: 16,
  },
  button: {
    padding: "10px 16px",
    background: "#333",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    fontSize: 16,
  },
  error: {
    color: "red",
    marginTop: 10,
  },
};
