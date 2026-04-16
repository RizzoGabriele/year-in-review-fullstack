import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from "passport";
import path from "path";
import { fileURLToPath } from "url";
import { configurePassport } from "./auth/passport.mjs";
import { initDb } from "./db/init.mjs";

import { registerThemesRoutes } from "./routes/themes.mjs";
import { registerTemplatesRoutes } from "./routes/templates.mjs";
import { registerRecapsRoutes } from "./routes/recaps.mjs";
import { registerUsersRoutes } from "./routes/users.mjs";
import { registerSessionsRoutes } from "./routes/sessions.mjs";

const app = express();
app.set('json spaces', 2);
const port = 3001;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));

app.use(express.json());


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/img", express.static(path.join(__dirname, "public", "img")));


app.use(session({ //firmare cookie, non creare sessioni vuote,
  secret: 'change-this-secret-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: false
  }
}));

// passport collegato alle sessioni
configurePassport();
app.use(passport.initialize());
app.use(passport.session());

// routes
registerThemesRoutes(app);
registerTemplatesRoutes(app);
registerRecapsRoutes(app);
registerUsersRoutes(app);
registerSessionsRoutes(app, passport);

// db inizializzazione e start server
try {
  await initDb();

  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
} catch (err) {
  process.exit(1);
}



