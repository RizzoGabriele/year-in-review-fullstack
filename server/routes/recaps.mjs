// routes/recaps.mjs
import { all, get, run } from "../db/db.mjs"; //array, singola riga, modifica o scrive
import { toIntParam } from "../utils/params.mjs";
import { isLoggedIn } from "../auth/middleware.mjs";

export function registerRecapsRoutes(app) {
  // /api/recaps/public
  app.get("/api/recaps/public", async (req, res) => {
  try {
    const rows = await all(
      `
      SELECT r.idRecap AS id,
             r.title,
             t.name AS theme,
             r.authorName AS author,
             r.derivedFromRecapId,
             r.derivedFromTitle,
             r.derivedFromAuthor
      FROM Recap r
      JOIN Theme t ON t.idTheme = r.idTheme
      WHERE r.visibility = 'public'
      ORDER BY r.idRecap ASC;
      `
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
});


  // /api/recaps/:recapId
  app.get("/api/recaps/:recapId", async (req, res) => {
    const recapId = toIntParam(req.params.recapId);
    if (recapId === null) return res.status(422).json({ error: "Invalid recapId" });

    try {
      const recap = await get( //cerco i recap con il recapId e faccio il Join per ottenere themeName
        `
        SELECT r.idRecap AS id,
               r.title,
               r.visibility,
               r.authorName AS author,
               r.idTheme AS themeId,
               t.name AS themeName,
               r.idUser AS ownerId,
               r.derivedFromRecapId,
               r.derivedFromTitle,
               r.derivedFromAuthor
        FROM Recap r
        JOIN Theme t ON t.idTheme = r.idTheme
        WHERE r.idRecap = ?;
        `,
        [recapId]
      );

      if (!recap) return res.status(404).json({ error: "Recap not found" });

      // Se è private lo vede solo il proprietario loggato
      if (recap.visibility === "private") {
        if (!req.isAuthenticated() || req.user.idUser !== recap.ownerId) {
          return res.status(404).json({ error: "Recap not found" });
        }
      }

      const pages = await all(  //Cerco le pagine aventi il recapId e recupero l'immagine per ogni pagina
          `
          SELECT rp.idRecapPage AS id,
                rp.pageIndex,
                i.idImage AS imageId,
                i.filePath,
                i.slotsCount,
                i.slotsLayoutJson
          FROM Recap_Page rp
          JOIN Image i ON i.idImage = rp.idImage
          WHERE rp.idRecap = ?
          ORDER BY rp.pageIndex ASC;
          `,
          [recapId]
        );


      const texts = await all( //cerco i testi delle pagine che hanno quel recapId
        `
        SELECT rp.idRecapPage AS recapPageId, rt.slotIndex, rt.text
        FROM Recap_Page rp
        LEFT JOIN Recap_Text rt ON rt.idRecapPage = rp.idRecapPage
        WHERE rp.idRecap = ?
        ORDER BY rp.pageIndex ASC, rt.slotIndex ASC;
        `,
        [recapId]
      );

      const mapTexts = new Map();
      for (const row of texts) {
        if (!mapTexts.has(row.recapPageId)) mapTexts.set(row.recapPageId, []);
        if (row.text !== null && row.text !== undefined) {
          mapTexts.get(row.recapPageId).push({ slotIndex: row.slotIndex, text: row.text }); //es slotIndex:0 text: Il mio anno in viaggio - 2025
        }
      }

      const pagesOut = pages.map((p) => ({ //per ogni immagine creiamo un oggetto sistemato visivamente
        id: p.id,
        pageIndex: p.pageIndex,
        image: {
          id: p.imageId,
          filePath: p.filePath,
          slotsCount: p.slotsCount,
          slotsLayoutJson: p.slotsLayoutJson,
        },
        texts: mapTexts.get(p.id) ?? [],
      }));


      // non serve restituire ownerId al client
      const { ownerId, ...safeRecap } = recap;
        res.json({ ...safeRecap, pages: pagesOut });
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  app.get("/api/recaps/:recapId/edit", isLoggedIn, async (req, res) => {
  const recapId = toIntParam(req.params.recapId);
    if (recapId === null) {
      return res.status(400).json({ error: "Invalid recapId" });
    }


  try {
    const row = await get(  //otteniamo id utente e idRecap
      `
      SELECT idRecap AS id, idUser
      FROM Recap
      WHERE idRecap = ?;
      `,
      [recapId]
    );

    if (!row) return res.status(404).json({ error: "Recap not found" });

    if (row.idUser !== req.user.idUser) { //se l'id dell'utente associato al recapId non è uguale all'id dell'utente loggato
      return res.status(403).json({ error: "Forbidden" });
    }

    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: "Database error" });
  }
});
  // /api/recaps (create)
  app.post("/api/recaps", isLoggedIn, async (req, res) => {
    const { sourceType, sourceId, title } = req.body;

    if (!["template", "recap"].includes(sourceType)) {
      return res.status(422).json({ error: "Invalid sourceType" });
    }

    const srcId = toIntParam(sourceId);
    if (srcId === null) return res.status(422).json({ error: "Invalid sourceId" });

    if (!title || typeof title !== "string") {
      return res.status(422).json({ error: "Invalid title" });
    }

    try {
      const idUser = req.user.idUser;
      const authorName = req.user.name;

      let themeId = null;
      let derived = { derivedFromRecapId: null, derivedFromTitle: null, derivedFromAuthor: null };

      if (sourceType === "template") {
        const tpl = await get(`SELECT idTheme FROM Template WHERE idTemplate=?;`, [srcId]);
        if (!tpl) return res.status(404).json({ error: "Template not found" });
        themeId = tpl.idTheme;
      } else {
        const srcRecap = await get( //ottengo le info di un dato recap
          `
          SELECT idRecap, title, authorName, idTheme, visibility
          FROM Recap WHERE idRecap=?;
          `,
          [srcId]
        );

        if (!srcRecap) return res.status(404).json({ error: "Source recap not found" });
        if (srcRecap.visibility !== "public") {
          return res.status(403).json({ error: "Source recap not public" });
        }

        themeId = srcRecap.idTheme;
        derived = {
          derivedFromRecapId: srcRecap.idRecap,
          derivedFromTitle: srcRecap.title,
          derivedFromAuthor: srcRecap.authorName,
        };
      }

      const ins = await run(
        `
        INSERT INTO Recap (title, visibility, idTheme, idUser, authorName, derivedFromRecapId, derivedFromTitle, derivedFromAuthor)
        VALUES (?, 'private', ?, ?, ?, ?, ?, ?);
        `,
        [title, themeId, idUser, authorName, derived.derivedFromRecapId, derived.derivedFromTitle, derived.derivedFromAuthor]
      );

      const newRecapId = ins.lastID;

      // copia pagine+testi
      if (sourceType === "template") {
        const tplPages = await all( //Prendo le pagine del template sorgente
          `
          SELECT idTemplatePage, pageIndex, idImage
          FROM Template_Page
          WHERE idTemplate = ?
          ORDER BY pageIndex ASC;
          `,
          [srcId]
        );

        const map = new Map(); // creo una mappa tra il template sorgente e il nuovo recap
        for (const p of tplPages) {
          const rIns = await run(
            `
            INSERT INTO Recap_Page (idRecap, pageIndex, idImage)
            VALUES (?, ?, ?);
            `,
            [newRecapId, p.pageIndex, p.idImage]
          );
          map.set(p.idTemplatePage, rIns.lastID);
        }

        if (tplPages.length > 0) { //se ci sono pagine nel template
          const tplTexts = await all( //prendo tutti i testi nelle pagine del template
            `
            SELECT idTemplatePage, slotIndex, text
            FROM Template_Text
            WHERE idTemplatePage IN (${tplPages.map(() => "?").join(",")})
            ORDER BY idTemplatePage ASC, slotIndex ASC;
            `,
            tplPages.map((p) => p.idTemplatePage)
          );

          for (const t of tplTexts) { //e le copio nella pagina recap
            await run(
              `
              INSERT INTO Recap_Text (idRecapPage, slotIndex, text)
              VALUES (?, ?, ?);
              `,
              [map.get(t.idTemplatePage), t.slotIndex, t.text]
            );
          }
        }
      } else {
        const srcPages = await all( //prendo pagine dal recap sorgente
          `
          SELECT idRecapPage, pageIndex, idImage
          FROM Recap_Page
          WHERE idRecap = ?
          ORDER BY pageIndex ASC;
          `,
          [srcId]
        );

        const map = new Map(); // crea una mappa tra pagine vecchie e nuove
        for (const p of srcPages) {
          const rIns = await run(
            `
            INSERT INTO Recap_Page (idRecap, pageIndex, idImage)
            VALUES (?, ?, ?);
            `,
            [newRecapId, p.pageIndex, p.idImage]
          );
          map.set(p.idRecapPage, rIns.lastID);
        }

        if (srcPages.length > 0) {
          const srcTexts = await all(
            `
            SELECT idRecapPage, slotIndex, text
            FROM Recap_Text
            WHERE idRecapPage IN (${srcPages.map(() => "?").join(",")})
            ORDER BY idRecapPage ASC, slotIndex ASC;
            `,
            srcPages.map((p) => p.idRecapPage)
          );

          for (const t of srcTexts) {
            await run(
              `
              INSERT INTO Recap_Text (idRecapPage, slotIndex, text)
              VALUES (?, ?, ?);
              `,
              [map.get(t.idRecapPage), t.slotIndex, t.text]
            );
          }
        }
      }

      res.status(201).json({ id: newRecapId });
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  // /api/recaps/:recapId (update meta)
  app.put("/api/recaps/:recapId", isLoggedIn, async (req, res) => {
    const recapId = toIntParam(req.params.recapId);
    if (recapId === null) return res.status(422).json({ error: "Invalid recapId" });

    const { title, visibility } = req.body;
    if (!title || typeof title !== "string") return res.status(422).json({ error: "Invalid title" });
    if (!["public", "private"].includes(visibility)) return res.status(422).json({ error: "Invalid visibility" });

    try {
      const recap = await get(`SELECT idUser FROM Recap WHERE idRecap=?;`, [recapId]);
      if (!recap) return res.status(404).json({ error: "Recap not found" });
      if (recap.idUser !== req.user.idUser) return res.status(403).json({ error: "Forbidden" });

      await run( //aggiornamento visibilità e titolo
        `
        UPDATE Recap
        SET title=?, visibility=?
        WHERE idRecap=?;
        `,
        [title, visibility, recapId]
      );

      res.status(204).end();
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });

  // /api/recaps/:recapId/pages (update pages)
  app.put("/api/recaps/:recapId/pages", isLoggedIn, async (req, res) => {
    const recapId = toIntParam(req.params.recapId);
    if (recapId === null) return res.status(422).json({ error: "Invalid recapId" });

    const { pages } = req.body;
    if (!Array.isArray(pages) || pages.length < 3) {
      return res.status(422).json({ error: "Pages must be an array with at least 3 pages" });
    }

    for (const p of pages) {
      if (!Number.isInteger(p.pageIndex) || p.pageIndex < 0) return res.status(422).json({ error: "Invalid pageIndex" });

      const imgId = toIntParam(p.imageId);
      if (imgId === null) return res.status(422).json({ error: "Invalid imageId" });

      if (!Array.isArray(p.texts)) return res.status(422).json({ error: "texts must be an array" });

      for (const t of p.texts) {
        if (!Number.isInteger(t.slotIndex) || t.slotIndex < 0 || t.slotIndex > 2) {
          return res.status(422).json({ error: "Invalid slotIndex" });
        }
        if (typeof t.text !== "string") return res.status(422).json({ error: "Invalid text" });
      }
    }

    try {
      const recap = await get(`SELECT idUser, idTheme FROM Recap WHERE idRecap=?;`, [recapId]);
      if (!recap) return res.status(404).json({ error: "Recap not found" });
      if (recap.idUser !== req.user.idUser) return res.status(403).json({ error: "Forbidden" });

      // reset pagine ( elimina i testi)
      await run(`DELETE FROM Recap_Page WHERE idRecap=?;`, [recapId]);

      for (const p of pages) {
        const img = await get(`SELECT idTheme, slotsCount FROM Image WHERE idImage=?;`, [p.imageId]);
        if (!img) return res.status(422).json({ error: `Image ${p.imageId} not found` });
        if (img.idTheme !== recap.idTheme) {
          return res.status(422).json({ error: `Image ${p.imageId} not allowed for this theme` });
        }

        const insPage = await run(
          `
          INSERT INTO Recap_Page (idRecap, pageIndex, idImage)
          VALUES (?, ?, ?);
          `,
          [recapId, p.pageIndex, p.imageId]
        );

        const recapPageId = insPage.lastID;

        for (const t of p.texts) {
          const trimmed = t.text.trim();//rimuove spazi all'inizio e alla fine
          if (trimmed.length === 0) continue; //se anche dopo il trim il testo e vuoto passa al testo successivo

          if (t.slotIndex >= img.slotsCount) {
            return res.status(422).json({ error: `slotIndex ${t.slotIndex} fuori dal range per l' immagine ${p.imageId}` });
          }

          await run(
            `
            INSERT INTO Recap_Text (idRecapPage, slotIndex, text)
            VALUES (?, ?, ?);
            `,
            [recapPageId, t.slotIndex, trimmed]
          );
        }
      }

      res.status(204).end();
    } catch (err) {
      res.status(500).json({ error: "Database error" });
    }
  });
  
}

