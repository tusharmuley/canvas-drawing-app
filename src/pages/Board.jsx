import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../services/api";
import DrawingBoard from "../components/DrawingBoard";

export default function Board() {
  const { slug } = useParams();
  const [initial, setInitial] = useState(null);
  const [projectName, setProjectName] = useState("");

  useEffect(() => {
    // Get board state
    api.get(`board/${slug}/state/`).then((r) => {
      setInitial(r.data);
    });

    // Get all projects and find the one matching slug
    api.get("projects/").then((r) => {
      const project = r.data.find((p) => p.slug === slug);
      if (project) setProjectName(project.name);
    });
  }, [slug]);

  if (!initial) return <p>Loading…</p>;

  return <DrawingBoard slug={slug} initial={initial} projectName={projectName} />;
}
