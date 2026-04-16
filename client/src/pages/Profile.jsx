import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api";
import ProgressBar from "../components/ProgressBar";
import StoryGreeting from "../components/StoryGreeting";

import "./Profile.css";


const BG_VIDEOS = [
  "/video/1_1.mov",
  "/video/1_2.mov",
  "/video/1_3.mov",
  "/video/1_4.mov",
];


export default function Profile() {

  const [recaps, setRecaps] = useState([]);  //contiene tutti i recap utente
  const [activeIdx, setActiveIdx] = useState(0); //id del recap attualmente usato
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/users/me/recaps") //utente loggato
      .then((data) => {
        if (!Array.isArray(data)) throw new Error("Formato risposta non valido");
        setRecaps(data);
        setActiveIdx(0);
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  const ordered = useMemo(() => { //ricalcola quando cambia recap
    const arr = Array.isArray(recaps) ? recaps.slice() : []; //come al solito copia l'array,
    arr.sort((a, b) => (a.id ?? 0) - (b.id ?? 0)); //ordina per id crescente
    return arr;
  }, [recaps]);

  const total = ordered.length;
  const safeIdx = Math.min(Math.max(activeIdx, 0), Math.max(total - 1, 0)); //versione safe di Activeidx
  const current = total > 0 ? ordered[safeIdx] : null; //se esiste almeno un recap prende quello attivo

  const bgVideoSrc = BG_VIDEOS[safeIdx % BG_VIDEOS.length];


 return (
    <div className="profile">
      {/* ERROR */}
      {err && <p className="profile-error">{err}</p>}

      {loading && <p>Caricamento...</p>}

      {!loading && !err && total === 0 && <p>Nessun riepilogo disponibile.</p>}

      {!loading && !err && total > 0 && current && (
        <div className="story-card">
          <StoryGreeting />

          <video
            className="story-video"
            src={bgVideoSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />

          <h3 className="story-heading">
            I miei riepiloghi
            <span className={"story-badge " + (current.visibility === "public" ? "is-public" : "is-private")}>
              {current.visibility}
            </span>
          </h3>

          <div className="story-overlay">
            <div className="story-text">
              <div className="story-title">{current.title}</div>

              <div className="story-sub">
                Theme: {current.theme ?? current.themeName ?? "—"}
                
              </div>
                

              <div className="story-actions">
                <Link className="story-link" to={`/recaps/${current.id}`}>
                  Apri
                </Link>

                <Link className="story-link" to={`/editor/${current.id}`}>
                  Modifica
                </Link>
              </div>
              {current.derivedFromRecapId != null && (
                  <div className="story-sub">
                    Ispirato a “{current.derivedFromTitle}” di {current.derivedFromAuthor}
                  </div>
                )}
              
            </div>
          </div>
          
          <ProgressBar total={total} index={safeIdx} setIndex={setActiveIdx} />
        </div>
      )}
    </div>
  );
}