import { all } from "../db/db.mjs";
import { isLoggedIn } from "../auth/middleware.mjs";

export function registerUsersRoutes(app) {
  app.get("/api/users/me/recaps", isLoggedIn, async (req, res) => {
    try {
      const rows = await all(
        `
        SELECT
          r.idRecap AS id,
          r.title,
          r.visibility,
          r.authorName AS author,
          t.name AS theme,

          r.derivedFromRecapId,
          r.derivedFromTitle,
          r.derivedFromAuthor
        FROM Recap r
        JOIN Theme t ON t.idTheme = r.idTheme
        WHERE r.idUser = ?
        ORDER BY r.idRecap ASC;
        `,
        [req.user.idUser] //l'id dell'utente loggato
      );
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });
}
