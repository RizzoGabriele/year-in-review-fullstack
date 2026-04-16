import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api";
import { useAuth } from "../auth/AuthContext";
import ProgressBar from "../components/ProgressBar";
import StoryGreeting from "../components/StoryGreeting";

import "./Home.css";


const BG_VIDEOS = [
    "/video/1_1.mov",
    "/video/1_2.mov",
    "/video/1_3.mov",
    "/video/1_4.mov",
  ];
  
export default function Home() {
  const { user, logout } = useAuth();
  const [recaps, setRecaps] = useState([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  

  useEffect(() => {
    apiFetch("/api/recaps/public")
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error("Formato risposta non valido");
        }
        setRecaps(data);
        setActiveIdx(0);
      })
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

const total = recaps.length;
const safeIdx = Math.min(Math.max(activeIdx, 0), Math.max(total - 1, 0));
const current = total > 0 ? recaps[safeIdx] : null;

const bgVideoSrc = BG_VIDEOS[safeIdx % BG_VIDEOS.length];

  return (
    <div className="home">
      
      {err && <p className="home-error">{err}</p>}

      {loading && <p>Caricamento...</p>}

      {!loading && recaps.length === 0 && (
        <p>Nessun riepilogo disponibile</p>
      )}

      {!loading && recaps.length > 0 && (
        <div className="story-card">
          {user && <StoryGreeting />}


          <video
            className="story-video"
            src={bgVideoSrc}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />

          <div className="story-heading-wrapper">
            <h3 className="story-heading">Riepiloghi pubblici</h3>

            {current?.theme && (
              <span className="story-theme-badge">
                <i className="bi bi-palette"></i>
                {current.theme}
              </span>
            )}
          </div>
          

          <div className="story-overlay">
            <div className="story-text">
              <div className="story-title">{current.title}</div>

              <div className="story-sub">
                {current.author}
              </div>
              

              <Link className="story-link" to={`/recaps/${current.id}`}>
                Apri
              </Link>
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
