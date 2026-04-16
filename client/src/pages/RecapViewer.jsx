import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { apiFetch } from "../api";
import ProgressBar from "../components/ProgressBar"; 
import "./RecapViewer.css";

//useState tengo in memoria dati che cmabiano
//useEffect chiamata API quando cambia url
//useMemo calcoli derivati (pages ordinate, layout slot, testi ordinati) senza rifarli ogni volta
//useParams in questo caso ottiene l'id del recap
//Link naviga senza refresh
//apiFetch in api.js gestisce cookie ed errori


export default function RecapViewer() {
  const { recapId } = useParams(); //id preso da Url
  const [recap, setRecap] = useState(null); //tutto il recap caricato da Backend
  const [pageIdx, setPageIdx] = useState(0); //indice della pagina che sto mostrando (0)
  const [loading, setLoading] = useState(true); //sei in caricamento
  const [err, setErr] = useState(""); //gestire il caso in cui API fallisce

  useEffect(() => { //se cambia url
    let mounted = true; //evita che la Promise prova a fare setState su un componente morto (se cambio pagina e il componente si smonta)
    setLoading(true); //imposta la pagina in loading
    setErr(""); //rimuove vecchi errori
    setRecap(null); //pulisce vecchio recap

    apiFetch(`/api/recaps/${recapId}`)
      .then((data) => {
        if (!mounted) return;
        setRecap(data); //se la chiamata va bene salva tutto altrimenti
        setPageIdx(0); //torna alla prima pagina
      })
      .catch((e) => mounted && setErr(e.message))  //se fallisce salva err con il messaggio
      .finally(() => mounted && setLoading(false)); //alla fine aggiorna loading

    return () => {
      mounted = false;
    };
  }, [recapId]);

  const pages = useMemo(() => { //se cambia recap
    const arr = Array.isArray(recap?.pages) ? recap.pages.slice() : []; //prende recap.pages e copia l'array
    arr.sort((a, b) => (a.pageIndex ?? 0) - (b.pageIndex ?? 0)); //ordina per pageIndex perchè potrebbero arrivare non ordinate dal DB
    return arr;
  }, [recap]);

  const total = pages.length;
  const safeIdx = Math.min(Math.max(pageIdx, 0), Math.max(total - 1, 0)); //impongo che le pagine partono da 0 e arrivano a total-1 (per evitare tipo pageIdx=-3)
  const page = total > 0 ? pages[safeIdx] : null; //pagina corrente

  const slotsLayout = useMemo(() => { //se cambia Page
    const raw = page?.image?.slotsLayoutJson; //se page o image è null o non definito allora raw=undefined
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw); //trasformo stringa in testo json
      return Array.isArray(parsed) ? parsed : []; //verifico se tutti gli elementi dell'array sono come mi aspetto
    } catch {
      return [];
    }
  }, [page]);

  

  const textsSorted = useMemo(() => { //se cambia pagina
    const t = Array.isArray(page?.texts) ? page.texts.slice() : []; //in t mette un array con i testi
    t.sort((a, b) => (a.slotIndex ?? 0) - (b.slotIndex ?? 0)); // ordina in testi per slotIndex
    return t;
  }, [page]);


  if (loading) return <div className="viewer">Loading...</div>;

  if (err) {
    return (
      <div className="viewer">
        <p className="viewer-error">{err}</p>
        <p>
          <Link to="/">Torna alla Home</Link>
        </p>
      </div>
    );
  }

  if (!recap) return <div className="viewer">Nessun dato.</div>;

  return (
    <div className="viewer">
      <div className="viewer-card">
        
        <div className="viewer-top">
          <div className="viewer-top-left">
            <div className="viewer-title">{recap.title}</div>
          </div>

          <Link className="viewer-close" to="/"> {/*Bottone X in alto a destra*/}
            <i className="bi bi-x-lg"></i>
          </Link>
        </div>

        {total === 0 || !page ? (
          <p className="viewer-empty">Nessuna pagina disponibile.</p>
        ) : (
          <>
            <img
              className="viewer-bg"
              src={page.image?.filePath}
              alt={`Pagina ${page.pageIndex}`}
            />


            <div className="viewer-overlay">
              <div className="viewer-texts">
                {textsSorted.map((t) => {
                  const slot = slotsLayout[t.slotIndex]; //collega il testo allo slot

                  const slotStyle = slot
                    ? {
                        top: `${slot.top}%`,
                        left: `${slot.left}%`,
                        width: `${slot.width}%`,
                      }
                    : {};

                  return (
                    <div key={t.slotIndex} className="viewer-slot" style={slotStyle}> {/*Dato uno slotIndex e lo slotStyle associato allo slotIndex*/}
                      <div className="viewer-text">{t.text}</div> {/* stampa il testo lì*/}
                    </div>
                  );
                })}
              </div>


            </div>


            <ProgressBar total={total} index={safeIdx} setIndex={setPageIdx} />
          </>
        )}
      </div>
        
    </div>
  );
}
