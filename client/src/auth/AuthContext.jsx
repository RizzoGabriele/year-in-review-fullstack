import { createContext, useContext, useEffect, useState } from "react";
import { apiFetch } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const u = await apiFetch("/api/sessions/current");
        if (mounted) setUser(u);
      } catch (err) {
       
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  async function login(username, password) {
    const u = await apiFetch("/api/sessions", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    setUser(u);
    return u;
  }

  async function logout() {
    await apiFetch("/api/sessions/current", { method: "DELETE" });
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
