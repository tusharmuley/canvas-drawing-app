import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { v4 as uuid } from "uuid";

export default function Projects() {
  const [list, setList] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    api.get("projects/").then((r) => setList(r.data));
  }, []);

  const create = async () => {
    if (!name.trim()) return;
    const slug = uuid();
    const { data } = await api.post("projects/", { name, slug });
    setList((prev) => [...prev, data]);
    setName("");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>My Projects</h2>
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New project name" />
      <button onClick={create}>Create</button>
      <ul>
        {list.map((p) => (
          <li key={p.slug}>
            <Link to={`/board/${p.slug}`}>{p.name}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
