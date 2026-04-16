import PagesCard from "./PagesCard";
import "./PagesEditor.css";
import { useState } from "react";


export default function PagesEditor({
  pagesDraft,
  images,
  canSavePages,
  savingPages,
  savePages,
  msgPages,
  updateImage,
  updateSlot,
  addPage,
  deletePage,
}) {
  const [toastMsg, setToastMsg] = useState("");

  function showToast(msg) {
  setToastMsg(msg);
  setTimeout(() => {
    setToastMsg("");
  }, 2000);
}

  return (
    <section className="pages-editor">
      

      <div className="pages-editor__list">
        {pagesDraft.map((p) => (
          <PagesCard
            key={p.pageIndex}
            page={p}
            images={images}
            updateImage={updateImage}
            updateSlot={updateSlot}
            deletePage={deletePage}
            totalPages={pagesDraft.length}
          />
        ))}
        <button
          type="button"
          className="pages-card pages-card--add"
          onClick={addPage}
          disabled={savingPages || !images?.length}
          title="Aggiungi pagina"
        >
          <i className="bi bi-plus-circle pages-card__addIcon"></i>
        </button>
      </div>
      
      <div className="pages-editor__footer">
        <div
          className="pages-editor__saveWrapper"
          title={
            !canSavePages
              ? "Aggiungi almeno 1 testo per ogni pagina"
              : ""
          }
        >
          <button
            onClick={() => {
              if (!canSavePages) {
                showToast("Aggiungi almeno 1 testo per ogni pagina");
                return;
              }
              savePages();
            }}
            disabled={savingPages}
          >
            {savingPages ? "Salvataggio..." : "Salva pagine"}
          </button>
        </div>

        {msgPages && <span className="pages-editor__saved">{msgPages}</span>}
      </div>
      {toastMsg && (
      <div className="pages-editor__toast">
        {toastMsg}
      </div>
    )}
    </section>
  );
}
