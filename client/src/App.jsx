// src/App.jsx
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import RequireAuth from "./auth/RequireAuth";
import { useEffect } from "react";

import NavBar from "./components/NavBar";
import BackgroundVideo from "./components/BgVideo";

import Home from "./pages/Home";
import Login from "./pages/Login";
import RecapViewer from "./pages/RecapViewer";
import Create from "./pages/Create";
import Editor from "./pages/Editor";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

import "./App.css";

function AppShell() {
  const { pathname } = useLocation();
  const showBgVideo = pathname !== "/login"; //escludiamo la home page

  useEffect(() => {
    const allowScroll =
      pathname === "/create" || pathname.startsWith("/editor/"); //su create o editor mi fa scrollare sulle altre pagine no
                                                                 // qui mi serviva scrollare per le PagesCard
    document.body.classList.toggle("no-scroll", !allowScroll);
    return () => document.body.classList.remove("no-scroll");
  }, [pathname]);

  return (
    <>    
      {showBgVideo && <BackgroundVideo src="/video/bg_video.mp4" />} {/*Mette in tutte le pag, eccetto Login o sfondo astratto */}
      

      <div className="navbar-position">
        <NavBar /> {/*Navbar in tutte le pag*/}
      </div>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/recaps/:recapId" element={<RecapViewer />} />

        <Route element={<RequireAuth />}>
          <Route path="/create" element={<Create />} />
          <Route path="/editor/:recapId" element={<Editor />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
}
