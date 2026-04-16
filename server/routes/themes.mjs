// routes/themes.mjs
import { all } from "../db/db.mjs";
import { toIntParam } from "../utils/params.mjs";

export function registerThemesRoutes(app) {
  // /api/themes
  app.get("/api/themes", async (req, res) => {
    try {
      const rows = await all(
        `SELECT idTheme AS id, name FROM Theme ORDER BY idTheme;`
      );
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  // /api/themes/:themeId/images
  app.get("/api/themes/:themeId/images", async (req, res) => {
    const themeId = toIntParam(req.params.themeId);
    if (themeId === null) return res.status(422).json({ error: "Invalid themeId" });

    try {
      const rows = await all(
        `
        SELECT idImage AS id, idTheme, filePath, slotsCount, slotsLayoutJson
        FROM Image
        WHERE idTheme = ?
        ORDER BY idImage ASC;
        `,
        [themeId]
      );
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });
}
