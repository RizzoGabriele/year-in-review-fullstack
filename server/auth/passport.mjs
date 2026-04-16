import passport from "passport";
import LocalStrategy from "passport-local";
import crypto from "crypto";
import { get } from "../db/db.mjs";

function scryptHash(password, salt) {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 32, (err, derivedKey) => { //genera hash data password e salt (hash di misura variabile 32-64)
      if (err) reject(err);
      else resolve(derivedKey.toString("hex"));
    });
  });
}

async function getUserByUsername(username) {
  return await get(
    "SELECT idUser, username, name, hash, salt FROM User WHERE username=?;",
    [username]
  );
}

async function getUserById(idUser) {
  return await get(
    "SELECT idUser, username, name FROM User WHERE idUser=?;",
    [idUser]
  );
}

export function configurePassport() {
  passport.use(
    new LocalStrategy(async (username, password, cb) => { 
      try {
        const user = await getUserByUsername(username); //aspetta di prendere l'username dalla funzione getUserByUsername tramite Promise
        if (!user) return cb(null, false, "Incorrect username or password");

        const computed = await scryptHash(password, user.salt); //genera hash

        const a = Buffer.from(user.hash, "hex");
        const b = Buffer.from(computed, "hex");
        if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) { //se la lunghezza delle hash è uguale (per evitare errori)
                                                                      // e se i byte sono tutti uguali (controllati tutti insieme)
          return cb(null, false, "Incorrect username or password");
        }

        return cb(null, { idUser: user.idUser, username: user.username, name: user.name });
      } catch (err) {
        return cb(err);
      }
    })
  );

  passport.serializeUser((user, cb) => cb(null, user.idUser));//ricostruire l’utente a ogni richiesta prende 
                                                              // l’idUser dalla sessione ricarica l’utente dal DB

  passport.deserializeUser(async (idUser, cb) => {// serve a dire a Passport cosa salvare nella sessione, NON 
                                                  //salva tutto l’utente, salva solo un identificatore minimo
    try {
      const user = await getUserById(idUser);
      if (!user) return cb(null, false);
      return cb(null, user);
    } catch (err) {
      return cb(err);
    }
  });

  return passport;
}
