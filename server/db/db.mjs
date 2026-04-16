import sqlite3 from "sqlite3";

export const db = new sqlite3.Database("./database.sqlite", (err) => {
  if (err) {
    process.exit(1);
  }
});

export function run(sql, params = []) { 
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

export function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => { //esegue query e ritorna una riga
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function all(sql, params = []) { //prende stringa sql e parametri
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => { //esegue query e ritorna array di righe
      if (err) reject(err);
      else resolve(rows);
    });
  });
}
