// routes/templates.mjs
import { all } from "../db/db.mjs";

export function registerTemplatesRoutes(app) {
  // /api/templates
  app.get("/api/templates", async (req, res) => {
    try {
      const rows = await all(
        `
        SELECT tpl.idTemplate AS id, tpl.title, t.idTheme AS themeId, t.name AS themeName
        FROM Template tpl
        JOIN Theme t ON t.idTheme = tpl.idTheme
        ORDER BY tpl.idTemplate ASC;
        `
      );
      res.json(rows);
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });
}
