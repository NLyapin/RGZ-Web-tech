import React, { useState } from "react";
import "../Profile.css";

const Profile = ({ username, onSave, onLogout }) => {
  const [name, setName] = useState(username || "");
  const [email, setEmail] = useState(localStorage.getItem("profileEmail") || "");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    localStorage.setItem("profileEmail", email);
    if (password) {
      localStorage.setItem("profilePasswordMask", "*".repeat(Math.min(password.length, 12)));
    }
    onSave(name.trim() || username);
    setStatus("Данные профиля сохранены.");
    setPassword("");
  };

  return (
    <section className="profile-page">
      <form className="profile-card" onSubmit={handleSubmit}>
        <h2>Профиль</h2>
        <p className="profile-subtitle">Здесь можно обновить данные и выйти из аккаунта</p>

        <label className="profile-label">
          Имя пользователя
          <input
            className="profile-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ваш логин"
          />
        </label>

        <label className="profile-label">
          Email
          <input
            className="profile-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </label>

        <label className="profile-label">
          Новый пароль
          <input
            className="profile-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Оставьте пустым, если без изменений"
          />
        </label>

        <div className="profile-actions">
          <button type="submit" className="profile-save-btn">
            Сохранить
          </button>
          <button type="button" className="profile-logout-btn" onClick={onLogout}>
            Выйти
          </button>
        </div>

        {status && <p className="profile-status">{status}</p>}
      </form>
    </section>
  );
};

export default Profile;
