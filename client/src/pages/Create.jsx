import { useEffect,useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../api";
import "./Create.css";

export default function Create() {
  const navigate = useNavigate();

  const [sourceType, setSourceType] = useState("template"); //inizialmente imposto come selezione iniziale Template
  const [sourceId, setSourceId] = useState("");
  const [title, setTitle] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [publicRecaps, setPublicRecaps] = useState([]);


  useEffect(() => {
  (async () => {
    try {
      const [tpls, recs] = await Promise.all([
        apiFetch("/api/templates"),
        apiFetch("/api/recaps/public"),
      ]);
      setTemplates(Array.isArray(tpls) ? tpls : []);
      setPublicRecaps(Array.isArray(recs) ? recs : []);
    } catch (e) {
      setErr(e.message);
    }
  })();
}, []);

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    const sid = Number.parseInt(sourceId, 10);
    if (!Number.isFinite(sid)) {
      setErr("SourceId non valido");
      return;
    }

    if (!title.trim()) { //rimuove spazi tab ecc dalla stringa
      setErr("Titolo obbligatorio");
      return;
    }

    try {
      setLoading(true);
      const created = await apiFetch("/api/recaps", {
        method: "POST",
        body: JSON.stringify({
          sourceType,
          sourceId: sid,
          title: title.trim(),
        }),
      });
      
      navigate(`/editor/${created.id}`);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="create">
      

      {err && <p className="create-error">{err}</p>}

      <form className="create-form" onSubmit={onSubmit}>
        <label>Seleziona Sorgente</label>
        <div className="source-type-switch">
          <button
            type="button"
            className={`source-btn ${sourceType === "template" ? "active" : ""}`}
            onClick={() => setSourceType("template")}
            disabled={loading}
          >
            Template
          </button>

          <button
            type="button"
            className={`source-btn ${sourceType === "recap" ? "active" : ""}`}
            onClick={() => setSourceType("recap")}
            disabled={loading}
          >
            Recap pubblico
          </button>
        </div>

        <label>
          {sourceType === "template" ? "Seleziona il tuo Template" : "Seleziona il Recap"}
        </label>
        <select
          value={sourceId}
          onChange={(e) => setSourceId(e.target.value)}
          disabled={loading}
        >
          <option value="" disabled>
            {sourceType === "template" ? "Scegli un template..." : "Scegli un recap..."}
          </option>

          {(sourceType === "template" ? templates : publicRecaps).map((item) => (
            <option key={item.id} value={String(item.id)}>
              {item.title}
              {item.author ? ` — ${item.author}` : ""}
            </option>
          ))}
        </select>

        <label>Scegli il titolo</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={loading}
          placeholder="Titolo del riepilogo"
        />

        <button className="btn-down" type="submit" disabled={loading}>
          {loading ? "Creazione..." : "Crea e vai all'editor"}
        </button>
      </form>
    </div>
  );
}
