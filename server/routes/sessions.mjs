export function registerSessionsRoutes(app, passport) {
  
  /*Creiamo sessione autenticata*/
  app.post("/api/sessions", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => { //chiamata alla LocalStrategy (in passport.mjs) per verificare utente autenticato
      if (err) return next(err);
      if (!user) return res.status(401).json({ error: info || "Invalid credentials" });

      req.login(user, (err2) => { //in questo salvo utente nella sessione
        if (err2) return next(err2);
        return res.json(user);
      });
    })(req, res, next);
  });

  /*Capire se l'utente e loggato e restituisce info utente*/
  app.get("/api/sessions/current", (req, res) => {
    if (req.isAuthenticated()) return res.json(req.user);
    return res.status(401).json({ error: "No authenticated user" });
  });

  /*elimina sessione utente*/
  app.delete("/api/sessions/current", (req, res) => {
    req.logout(() => {
      req.session?.destroy(() => res.status(204).end());
    });
  });
}
