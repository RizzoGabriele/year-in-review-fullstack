import "./RecapForm.css";

export default function RecapForm({
  title,
  onTitleChange,
  visibility,
  onVisibilityChange,
  onSubmit,
  saving = false,
  message = "",
}) {
  return (
    <section className="editor-section">

      <form className="recap-form" onSubmit={onSubmit}>
        <label>Modifica titolo del riepilogo</label>
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          disabled={saving}
          placeholder="Titolo del riepilogo"
        />
        <label>Seleziona la visibility del riepilogo</label>

        <div className="visibility-toggle">
          <button
            type="button"
            className={
              "visibility-btn" +
              (visibility === "private" ? " is-active" : "")
            }
            onClick={() => onVisibilityChange("private")}
            disabled={saving}
          >
            Privato
          </button>

          <button
            type="button"
            className={
              "visibility-btn" +
              (visibility === "public" ? " is-active" : "")
            }
            onClick={() => onVisibilityChange("public")}
            disabled={saving}
          >
            Pubblico
          </button>
        </div>

        <div className="recap-form-actions">
          <button type="submit" disabled={saving}>
            {saving ? "Salvataggio..." : "Salva dettagli"}
          </button>

          {message && <span className="recap-form-saved">{message}</span>}
        </div>
      </form>
    </section>
  );
}
