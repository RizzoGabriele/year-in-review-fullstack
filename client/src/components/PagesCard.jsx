import { useEffect, useMemo, useState } from "react";
import "./PagesCard.css";

export default function PagesCard({ page, images, updateImage, updateSlot, deletePage, totalPages }) {
  const themeImages = useMemo(() => (Array.isArray(images) ? images : []), [images]);

  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!themeImages.length) {
      setIdx(0);
      return;
    }

    if (page.imageId != null) {
      const found = themeImages.findIndex((im) => im.id === page.imageId);
      if (found >= 0) {
        setIdx(found);
        return;
      }
    }
    setIdx(0);
    const first = themeImages[0];
    if (first && page.imageId !== first.id) {
      updateImage(page.pageIndex, first.id);
    }
  }, [themeImages, page.imageId, page.pageIndex, updateImage]);

  const current = themeImages[idx] || null;

  function prev() {
    if (!themeImages.length) return;
    const nextIdx = (idx - 1 + themeImages.length) % themeImages.length;
    setIdx(nextIdx);
    updateImage(page.pageIndex, themeImages[nextIdx].id);
  }

  function next() {
    if (!themeImages.length) return;
    const nextIdx = (idx + 1) % themeImages.length;
    setIdx(nextIdx);
    updateImage(page.pageIndex, themeImages[nextIdx].id);
  }

  return (
    <div className="pages-card">
      <div className="pages-card__title">
        <strong className="pages-card__title-text">
          Pagina {page.pageIndex + 1}
        </strong>

        <button
        type="button"
        className="pages-card__delete"
        onClick={() => deletePage(page.pageIndex)}
        disabled={totalPages <= 3}
        title={totalPages <= 3 ? "Minimo 3 pagine" : "Delete Page"}
      >
        <i className="bi bi-x-lg"></i>
        <span>Delete Page</span>
</button>

      </div>


      <div className="pages-card__carousel">
        <div className="pages-card__carousel-head">
          <label>Scegli immagine</label>
          <div className="pages-card__counter">
            {themeImages.length ? `${idx + 1} / ${themeImages.length}` : "0 / 0"}
          </div>
        </div>

        <div className="pages-card__carousel-body">
          <button
            type="button"
            className="pages-card__arrow"
            onClick={prev}
            disabled={themeImages.length <= 1}
            title="Precedente"
          >
            <i className="bi bi-arrow-left-circle-fill"></i>
          </button>

          <div className="pages-card__frame">
            {current ? (
              <img src={current.filePath} alt={`Immagine #${current.id}`} loading="lazy" />
            ) : (
              <div className="pages-card__empty">Nessuna immagine disponibile</div>
            )}
          </div>

          <button
            type="button"
            className="pages-card__arrow"
            onClick={next}
            disabled={themeImages.length <= 1}
            title="Successiva"
          >
            <i className="bi bi-arrow-right-circle-fill"></i>
          </button>
        </div>
      </div>

      <div className="pages-card__slots">
        {page.slots.map((val, i) => (
          <div className="pages-card__slot" key={i}>
            <label>Testo {i + 1}</label>
            <textarea
              value={val}
              onChange={(e) => updateSlot(page.pageIndex, i, e.target.value)}
              rows={2}
              maxLength={50}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
