import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
  NavLink,
  useLocation,
  Link,
} from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import VideoList from "./components/VideoList";
import VideoPlayer from "./components/VideoPlayer";
import VideoUpload from "./components/VideoUpload";
import Profile from "./components/Profile";
import Bg2x from "./components/Bg2x";
import accountIcon from "./assets/account.svg";
import logoutIcon from "./assets/logout.svg";
import "./App.css";

const Header = ({ isAuthenticated, username, onLogout }) => {
  const location = useLocation();
  const isAuthPage = ["/login", "/register"].includes(location.pathname);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="header">
      <div className="header-left">
        {!isAuthPage && isAuthenticated && (
          <button
            type="button"
            className={`burger-btn ${menuOpen ? "open" : ""}`}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Открыть меню"
          >
            <span />
            <span />
            <span />
          </button>
        )}
        <div className="logo">
          <svg
            width="97"
            height="70"
            viewBox="0 0 97 70"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M37.8812 19.7437L29.2847 34.6222H46.4777L37.8812 19.7437Z"
              fill="white"
            />
            <path
              d="M22.247 0L11.0999 19.3185V34.6222H28.6235V19.224L39.7234 0H22.247Z"
              fill="white"
            />
            <path
              d="M47.1391 69.9526H66.741L47.1391 35.9917V69.9526Z"
              fill="white"
            />
            <path
              d="M28.6707 35.3304H11.0999V69.9526H28.6707V35.3304Z"
              fill="white"
            />
            <path
              d="M79.5411 35.3304C69.9999 35.3304 62.2064 43.124 62.2064 52.6651C62.2064 62.2063 69.9999 69.9998 79.5411 69.9998C89.0823 69.9998 96.8758 62.2063 96.8758 52.6651C96.8758 43.0767 89.1295 35.3304 79.5411 35.3304Z"
              fill="white"
            />
            <path
              d="M29.3322 35.3304V69.9526C38.8733 69.9526 46.6668 62.1591 46.6668 52.6179C46.6668 43.0767 38.8733 35.3304 29.3322 35.3304Z"
              fill="white"
            />
            <path
              d="M47.2808 34.6222H69.0082L49.1702 0.236206L38.3065 19.0824L47.2808 34.6222Z"
              fill="white"
            />
            <path
              d="M47.5642 35.3304L57.1999 52.0511C60.7896 50.9647 63.2458 47.6584 63.2458 43.8797C63.2458 39.1564 59.4198 35.3304 54.6965 35.3304H47.5642Z"
              fill="white"
            />
            <path d="M0 0L10.722 18.61L21.444 0H0Z" fill="white" />
          </svg>
        </div>
      </div>

      {!isAuthPage && (
        <div className="user-info">
          {isAuthenticated ? (
            <div className="user-block">
              <span className="username plain">{username || "Пользователь"}</span>
              <Link to="/profile" className="icon-only-btn" aria-label="Профиль">
                <img src={accountIcon} alt="" />
              </Link>
              <button type="button" className="icon-only-btn" onClick={onLogout} aria-label="Выйти">
                <img src={logoutIcon} alt="" />
              </button>
            </div>
          ) : (
            <NavLink className="header-register" to="/register">
              Регистрация
            </NavLink>
          )}
        </div>
      )}

      {!isAuthPage && isAuthenticated && (
        <>
          <div
            className={`menu-backdrop ${menuOpen ? "show" : ""}`}
            onClick={() => setMenuOpen(false)}
          />
          <aside className={`side-menu ${menuOpen ? "open" : ""}`}>
            <NavLink to="/videos" className="side-link">
              Видео
            </NavLink>
            <NavLink to="/upload" className="side-link">
              Импорт
            </NavLink>
            <NavLink to="/profile" className="side-link">
              Профиль
            </NavLink>
          </aside>
        </>
      )}
    </header>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem("authToken") !== null;
  });
  const [username, setUsername] = useState(localStorage.getItem("authUser") || "");

  const handleLogin = (token, loginName) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("authUser", loginName);
    setUsername(loginName);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUsername("");
    setIsAuthenticated(false);
  };

  const handleRegister = () => {
    setIsAuthenticated(false);
  };

  const handleProfileSave = (nextUsername) => {
    if (nextUsername) {
      localStorage.setItem("authUser", nextUsername);
      setUsername(nextUsername);
    }
  };

  return (
    <div className="app">
      <Router>
        <Header isAuthenticated={isAuthenticated} username={username} onLogout={handleLogout} />
        <main className="app-content">
          <Routes>
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register onRegister={handleRegister} />} />
            <Route path="/bg2x" element={<Bg2x />} />
            {isAuthenticated ? (
              <>
                <Route path="/videos" element={<VideoList />} />
                <Route path="/video/:id" element={<VideoPlayer />} />
                <Route path="/upload" element={<VideoUpload />} />
                <Route
                  path="/profile"
                  element={<Profile username={username} onSave={handleProfileSave} onLogout={handleLogout} />}
                />
                <Route path="*" element={<Navigate to="/videos" />} />
              </>
            ) : (
              <>
                <Route path="/videos" element={<Navigate to="/login" />} />
                <Route path="/video/:id" element={<Navigate to="/login" />} />
                <Route path="/upload" element={<Navigate to="/login" />} />
                <Route path="/profile" element={<Navigate to="/login" />} />
                <Route path="*" element={<Navigate to="/login" />} />
              </>
            )}
          </Routes>
        </main>
      </Router>
    </div>
  );
};

export default App;
