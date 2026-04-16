import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import "./Login.css";


export default function Login() {
  const { login } = useAuth(); //chiama la funzione login in AuthContext
  const nav = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState(""); //creo stato username stringa vuota
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
  const [err, setErr] = useState("");

  async function onSubmit(e) { 
    e.preventDefault(); //blocco il comportamento classico del form (ricaricherebbe la pagina)
    setErr("");
    try {
      await login(username, password);
      const to = location.state?.from?.pathname || "/"; //dopo il login vai alla home
      nav(to, { replace: true });
    } catch (e2) {
      setErr(e2.message);
    }
  }

  return (
    <div className="login-bg">
      <img
        src="/img/airplane.png"
        alt="Flying plane"
        className="flying-plane"
      />


      <div className="left-panel">
        <div className="login-text">
          <h1>Relive your year</h1>
        </div>


      </div>


      <div className="right-panel">
        <div className="login">
          <h2 className="login-title">Great to see you again!</h2>

          <form className="login-form" onSubmit={onSubmit}>
            <label className="margine">Username</label>
            <input
              className="login-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)} //ogni lettera messa o tolta o testo incollato, aggiorna lo stato React di username
              placeholder="Username"
              required
            />

            <label className="margine">Password</label>
                <input
                  className="login-input"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                  <span>
                    {showPassword ? "Hide password" : "Show password"}
                  </span>
                </button>


            <button className="margine" type="submit">Login</button>
          </form>

          {err && <p className="login-error">{err}</p>}
        </div>
      </div>
    </div>
  );
}
