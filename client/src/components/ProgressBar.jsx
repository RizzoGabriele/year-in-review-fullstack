import { useEffect, useRef, useState } from "react";
import "./ProgressBar.css";
//useState tengo in memoria dati che cmabiano
//useEffect chiamata API quando cambia url
//useRef è un postit che si ricorda anche se cambia useState

const DURATION_MS = 5000;
const TICK_MS = 50; //ogni quanto la barra avanza un pochino

export default function ProgressBar({ total, index, setIndex }) {
  if (!total || total <= 1) return null;

  const isFirst = index <= 0;
  const isLast = index >= total - 1;

  const [progress, setProgress] = useState(0);
  const startRef = useRef(null); //appena parte la pagina
  const timerRef = useRef(null); //timer 
  function prev() {
    setIndex((i) => Math.max(0, i - 1));
  }

  function next() {
    setIndex((i) => Math.min(total - 1, i + 1));
  }

  useEffect(() => { //se cambia pagina o numero totale di pagine allora azzera la barra
    setProgress(0);
  }, [index, total]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current); // pulizia vecchi timer

    startRef.current = Date.now();
    timerRef.current = setInterval(() => { //esegue ogni 50ms
      const elapsed = Date.now() - startRef.current; //tempo passato
      const p = Math.min(1, elapsed / DURATION_MS); //calcola una sorta di percentuale su 5 secondi (tempo passato/ 5 secondi)
      setProgress(p);
      if (p >= 1) { //caso di raggiungimento dei 5 secondi
        clearInterval(timerRef.current); 
        timerRef.current = null; //ferma il timer
        setIndex((i) => { //pagina successiva
          if (i >= total - 1) return i;
          return i + 1;
        });
      }
    }, TICK_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [index, total, setIndex]);

  return (
    <div className="pb">
      <div className="pb-segs">
        {Array.from({ length: total }, (_, i) => {//crea un array lungo total
          let fill = 0;
          if (i < index) fill = 1; //pagine già viste
          else if (i === index) fill = progress;
          return (
            <div key={i} className="pb-seg">
              <div
                className="pb-segfill"
                style={{ width: `${fill * 100}%` }} //riempimento barra in base alla percentuale
              />
            </div>
          );
        })}
      </div>

      <button className="pb-btn" onClick={prev} disabled={isFirst}>
        <i className="bi bi-arrow-left-circle"></i>
      </button>

      <button className="pb-btn" onClick={next} disabled={isLast}>
        <i className="bi bi-arrow-right-circle"></i>
      </button>
    </div>
  );
}
