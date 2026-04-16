import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { apiFetch } from "../api";
import "./Editor.css";
import RecapForm from "../components/RecapForm";
import PagesEditor from "../components/PagesEditor";

function ensureSlots(texts = [], slots = 3) { //prendere texts e trasforma in un array posizionale di lunghezza slots
  const out = new Array(slots).fill("");
  for (const t of texts) {
    if (
      Number.isInteger(t.slotIndex) &&
      t.slotIndex >= 0 &&
      t.slotIndex < slots
    ) {
      out[t.slotIndex] = typeof t.text === "string" ? t.text : "";
    }
  }
  return out;
}

export default function Editor() {
  const { recapId } = useParams();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [pagesDraft, setPagesDraft] = useState([]);
  const [themeId, setThemeId] = useState(null);
  const [images, setImages] = useState([]);
  const [savingMeta, setSavingMeta] = useState(false);
  const [savingPages, setSavingPages] = useState(false);
  const [msgMeta, setMsgMeta] = useState("");
  const [msgPages, setMsgPages] = useState("");

  useEffect(() => { //quando cambia recapid
    let mounted = true;

    async function load() {
      setLoading(true);
      setErr("");
      setMsgMeta("");
      setMsgPages("");

      try {
        await apiFetch(`/api/recaps/${recapId}/edit`);

        const recap = await apiFetch(`/api/recaps/${recapId}`);//prendiamo in recap in questione
        if (!mounted) return;

        setTitle(recap?.title ?? ""); //se esiste mette recap.title altrimenti se null mette ""
        setVisibility(recap?.visibility ?? "private"); //se non esiste mette private
        setThemeId(recap?.themeId ?? null);

        let themeImages = [];
        if (recap?.themeId != null) {
          const imgs = await apiFetch(`/api/themes/${recap.themeId}/images`);
          if (!mounted) return;
          themeImages = Array.isArray(imgs) ? imgs : [];
          setImages(themeImages);
        } else {
          setImages([]);
        }

        // pagine
        const pages = Array.isArray(recap?.pages) ? recap.pages : [];
        const draft = pages
          .slice()
          .sort((a, b) => (a.pageIndex ?? 0) - (b.pageIndex ?? 0)) //ordina per pageindex
          .map((p) => {
            const imageId = p?.image?.id ?? null; //ricavo imageId

            const slotsCount =
              p?.image?.slotsCount ?? //se la pagina ha un'immagine già associata usa il suo slotscount
              themeImages.find((im) => im.id === imageId)?.slotsCount ?? //altrimenti cerca l'immagine in themeImages e se la trova usa lo slotscount
              3;

            return {
              pageIndex: p.pageIndex,
              imageId,
              filePath: p?.image?.filePath ?? "",
              slotsCount,
              slots: ensureSlots(p?.texts, slotsCount),//trasforma i testi del backend in un array della lunghezza giusta
            };
          });

        setPagesDraft(draft);
      } catch (e) {
        if (!mounted) return;
        setErr(e.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, [recapId]);

  function deletePage(pageIndexToDelete) {
  setErr("");

  setPagesDraft((prev) => {
    if (prev.length <= 3) {
      setErr("Devi avere almeno 3 pagine (non puoi eliminare oltre).");
      return prev;
    }

    const remaining = prev.filter((p) => p.pageIndex !== pageIndexToDelete);
    const sorted = remaining
      .slice()
      .sort((a, b) => (a.pageIndex ?? 0) - (b.pageIndex ?? 0));

    return sorted.map((p, i) => ({
      ...p,
      pageIndex: i,
    }));
  });
}

  const canSavePages = useMemo(() => { //quando cambia pagesDraft allora calcola un valore booleano
    return (
      Array.isArray(pagesDraft) && //è un array?
      pagesDraft.length >= 3 &&
      pagesDraft.every( //controlla che tutte le pagine rispettano le regole
        (p) =>
          Number.isInteger(p.pageIndex) &&
          p.imageId &&
          Array.isArray(p.slots) &&
          p.slots.some((t) => (t ?? "").trim().length > 0)
      )
    );
  }, [pagesDraft]);

  async function saveMeta(e) { //viene chiamata quando si submitta il form
    e.preventDefault();
    setErr("");
    setMsgMeta("");

    const t = title.trim();
    if (!t) return setErr("Titolo obbligatorio");
    if (visibility !== "public" && visibility !== "private")
      return setErr("Visibilità non valida");

    try {
      setSavingMeta(true);
      await apiFetch(`/api/recaps/${recapId}`, {
        method: "PUT",
        body: JSON.stringify({ title: t, visibility }),
      });
      setMsgMeta("✅");
    } catch (e) {
      setErr(e.message);
    } finally {
      setSavingMeta(false);
    }
  }

  function updateSlot(pageIndex, slotIndex, value) { 
    setPagesDraft((prev) =>
      prev.map((p) => {
        if (p.pageIndex !== pageIndex) return p;
        const nextSlots = p.slots.slice();
        nextSlots[slotIndex] = value; //sostituisce il testo nello slot indicato
        return { ...p, slots: nextSlots };
      })
    );
  }


  function updateImage(pageIndex, newImageId) {
    setPagesDraft((prev) =>
      prev.map((p) => {
        if (p.pageIndex !== pageIndex) return p;

        const idNum = Number.parseInt(newImageId, 10);
        const chosen = images.find((im) => im.id === idNum); //trova l'immagine dentro images
        if (!chosen || !Number.isFinite(idNum)) return p;

        const newSlotsCount = chosen.slotsCount ?? 3;//calcola il numero di slot per immagine, se non trova mette 3

        const nextSlots = new Array(newSlotsCount).fill("");
        for (let i = 0; i < Math.min(p.slots.length, newSlotsCount); i++) { //copia i testi giò esistenti
          nextSlots[i] = p.slots[i] ?? "";
        }

        return {
          ...p,
          imageId: idNum,
          filePath: chosen.filePath ?? p.filePath,
          slotsCount: newSlotsCount,
          slots: nextSlots,
        };
      })
    );
  }

  function addPage() {
  if (!Array.isArray(images) || images.length === 0) {
    setErr("Nessuna immagine disponibile per questo tema");
    return;
  }

  setPagesDraft((prev) => {
    const maxIndex = prev.reduce(
      (m, p) => Math.max(m, Number.isInteger(p.pageIndex) ? p.pageIndex : -1), //trovo pageindex più grande
      -1
    );
    const nextPageIndex = maxIndex + 1;

    const first = images[0];
    const slotsCount = first?.slotsCount ?? 3;

    const newPage = {
      pageIndex: nextPageIndex,
      imageId: first.id,
      filePath: first.filePath ?? "",
      slotsCount,
      slots: new Array(slotsCount).fill(""),
    };

    return [...prev, newPage];
  });
}

  async function savePages() {
    setErr("");
    setMsgPages("");

    if (!canSavePages) {
      setErr(
        "Pagine non valide: servono almeno 3 pagine, ogni pagina deve avere un'immagine e almeno un testo compilato"
      );
      return;
    }

    const payload = {
      pages: pagesDraft.map((p) => ({
        pageIndex: p.pageIndex,
        imageId: p.imageId,
        texts: p.slots.map((txt, slotIndex) => ({
          slotIndex,
          text: txt ?? "",
        })),
      })),
    };

    try {
      setSavingPages(true);
      await apiFetch(`/api/recaps/${recapId}/pages`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setMsgPages("✅");
    } catch (e) {
      setErr(e.message);
    } finally {
      setSavingPages(false);
    }
  }

  if (loading) {
    return (
      <div className="editor">
        <p>Caricamento...</p>
      </div>
    );
  }

  if (err) {
    return (
      <div className="editor editor--center">
        <p className="editor-error">{err}</p>
        <p className="editor-error">{"Rifare la procedura"}</p>
        
      </div>
    );
  }

  return (
    <div className="editor">
      <RecapForm
        title={title}
        onTitleChange={setTitle}
        visibility={visibility}
        onVisibilityChange={setVisibility}
        onSubmit={saveMeta}
        saving={savingMeta}
        message={msgMeta}
      />

      <PagesEditor
        pagesDraft={pagesDraft}
        images={images}
        canSavePages={canSavePages}
        savingPages={savingPages}
        savePages={savePages}
        msgPages={msgPages}
        updateImage={updateImage}
        updateSlot={updateSlot}
        addPage={addPage}
        deletePage={deletePage}
      />
    </div>
  );
}
