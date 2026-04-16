import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "./NavBar.css";


function Item({ to, label, icon }) {
  return (
    
    <NavLink
      to={to}
      end={to === "/"}
      className={({ isActive }) =>
        "pillbar__item" + (isActive ? " is-active" : "")
      }
    >
      <i className={`bi ${icon}`}></i>

      <span>{label}</span>
    </NavLink>
  );
}

function ActionItem({ onClick, label, icon }) {
  return (
    <button type="button" className="pillbar__item pillbar__btn" onClick={onClick}>
      <i className={`bi ${icon}`}></i>
      <span>{label}</span>
    </button>
  );
}

export default function NavBar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth(); 
  const isLogged = !!user;

  const ICON_OF = {
  Home: "bi-house",
  Profile: "bi-person",
  Create: "bi-plus-circle",
  Login: "bi-box-arrow-in-right",
  Logout: "bi-box-arrow-right",
};

  const isHome = pathname === "/";
  const isRecapViewer = pathname.startsWith("/recap");    
  const isCreate = pathname.startsWith("/create");
  const isEditor = pathname.startsWith("/editor");
  const isProfile = pathname.startsWith("/profile");
  const isLogin = pathname.startsWith("/login");


  // Home: solo Login, oppure (se loggato) Profile + Create
  // RecapViewer: Home + Profile
  // Create: Home + Profile
  // Editor: Home + Profile
  // Profile: Home + logout
  // Login: Home

  const showLogout = isLogged && (isHome || isProfile);

  let buttons = [];

  if (isHome) {
      if (isLogged) buttons = ["Profile", "Create"];
      else buttons = ["Login"];
    } else if (isLogin) {
      buttons = ["Home"];
    } else if (isProfile) {
      buttons = ["Home"];
    } else if (isRecapViewer || isCreate || isEditor) {
      buttons = ["Home", "Login"];
    } else {
      buttons = ["Home"];
    }


  const routeOf = {
    Home: "/",
    Profile: "/profile",
    Create: "/create",
    Login: "/login",
  };

  return (
    <nav className="pillbar">
      {buttons.map((b) => (
        <Item
          key={b}
          to={routeOf[b]}
          label={b}
          icon={ICON_OF[b]}
        />
      ))}

      {showLogout && (
        <ActionItem
          label="Logout"
          icon={ICON_OF.Logout}
          onClick={logout}
        />
      )}
    </nav>
  );


}
