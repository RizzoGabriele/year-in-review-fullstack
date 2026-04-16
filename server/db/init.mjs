import { run } from "./db.mjs";

export async function initDb() {
  await run("PRAGMA foreign_keys = ON;");

  await run(`
    CREATE TABLE IF NOT EXISTS User (
      idUser   INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      name     TEXT NOT NULL,
      hash     TEXT NOT NULL,
      salt     TEXT NOT NULL
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS Theme (
      idTheme INTEGER PRIMARY KEY AUTOINCREMENT,
      name    TEXT NOT NULL UNIQUE
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS Image (
      idImage         INTEGER PRIMARY KEY AUTOINCREMENT,
      idTheme         INTEGER NOT NULL,
      filePath        TEXT NOT NULL,
      slotsCount      INTEGER NOT NULL CHECK (slotsCount IN (1,2,3)),
      slotsLayoutJson TEXT NOT NULL,
      FOREIGN KEY (idTheme) REFERENCES Theme(idTheme)
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS Template (
      idTemplate INTEGER PRIMARY KEY AUTOINCREMENT,
      idTheme    INTEGER NOT NULL,
      title      TEXT NOT NULL,
      FOREIGN KEY (idTheme) REFERENCES Theme(idTheme)
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS Template_Page (
      idTemplatePage INTEGER PRIMARY KEY AUTOINCREMENT,
      idTemplate     INTEGER NOT NULL,
      pageIndex      INTEGER NOT NULL,
      idImage        INTEGER NOT NULL,
      FOREIGN KEY (idTemplate) REFERENCES Template(idTemplate),
      FOREIGN KEY (idImage) REFERENCES Image(idImage),
      UNIQUE (idTemplate, pageIndex)
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS Template_Text (
      idTemplateText INTEGER PRIMARY KEY AUTOINCREMENT,
      idTemplatePage INTEGER NOT NULL,
      slotIndex      INTEGER NOT NULL CHECK (slotIndex >= 0 AND slotIndex <= 2),
      text           TEXT,
      FOREIGN KEY (idTemplatePage) REFERENCES Template_Page(idTemplatePage),
      UNIQUE (idTemplatePage, slotIndex)
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS Recap (
      idRecap            INTEGER PRIMARY KEY AUTOINCREMENT,
      title              TEXT NOT NULL,
      visibility         TEXT NOT NULL CHECK (visibility IN ('public','private')),
      idTheme            INTEGER NOT NULL,
      idUser             INTEGER NOT NULL,
      authorName         TEXT NOT NULL,
      derivedFromRecapId INTEGER,
      derivedFromTitle   TEXT,
      derivedFromAuthor  TEXT,
      FOREIGN KEY (idTheme) REFERENCES Theme(idTheme),
      FOREIGN KEY (idUser)  REFERENCES User(idUser),
      FOREIGN KEY (derivedFromRecapId) REFERENCES Recap(idRecap)
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS Recap_Page (
      idRecapPage INTEGER PRIMARY KEY AUTOINCREMENT,
      idRecap     INTEGER NOT NULL,
      pageIndex   INTEGER NOT NULL,
      idImage     INTEGER NOT NULL,
      FOREIGN KEY (idRecap) REFERENCES Recap(idRecap) ON DELETE CASCADE,
      FOREIGN KEY (idImage) REFERENCES Image(idImage),
      UNIQUE (idRecap, pageIndex)
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS Recap_Text (
      idRecapText INTEGER PRIMARY KEY AUTOINCREMENT,
      idRecapPage INTEGER NOT NULL,
      slotIndex   INTEGER NOT NULL CHECK (slotIndex >= 0 AND slotIndex <= 2),
      text        TEXT,
      FOREIGN KEY (idRecapPage) REFERENCES Recap_Page(idRecapPage) ON DELETE CASCADE,
      UNIQUE (idRecapPage, slotIndex)
    );
  `);
}
