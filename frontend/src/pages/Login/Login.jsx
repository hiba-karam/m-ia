import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../hooks/useAuth.jsx";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { loginLocal } = useAuth();
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    loginLocal({ username: email, password });
    navigate("/dashboard");
  }

  return (
    <div className="login">
      <div className="login__background" />

      <div className="login__container">
        <div className="login__header">
          <div className="login__header-logo">
            <ShieldCheck size={28} strokeWidth={2.5} />
          </div>
          <h1 className="login__header-title">M-IA</h1>
          <p className="login__header-subtitle">Plateforme de Support Intelligent</p>
          <p className="login__header-org">Pour M-AUTOMOTIV</p>
        </div>

        <div className="login__card">
          <h2 className="login__card-title">Connexion</h2>
          <p className="login__card-subtitle">Entrez vos identifiants pour continuer</p>

          <form onSubmit={handleSubmit} className="login__form">
            <div className="login__field">
              <label htmlFor="email">Adresse email</label>
              <div className="login__input-wrapper">
                <Mail size={16} className="login__input-icon" />
                <input
                  id="email" type="email" placeholder="exemple@email.com"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="login__field">
              <label htmlFor="password">Mot de passe</label>
              <div className="login__input-wrapper">
                <Lock size={16} className="login__input-icon" />
                <input
                  id="password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                  value={password} onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="login__toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="login__btn-submit">
              Se connecter
            </button>
          </form>

          <div className="login__test-credentials">
            <div className="login__test-label">IDENTIFIANTS DE TEST :</div>
            <div className="login__test-row">
              <span className="login__test-role">Admin</span>
              <span className="login__test-detail">admin@mia.local / password123</span>
            </div>
            <div className="login__test-row">
              <span className="login__test-role">Agent</span>
              <span className="login__test-detail">agent@mia.local / password123</span>
            </div>
          </div>
        </div>

        <footer className="login__footer">
          © 2024 M-IA • Plateforme de Support Intelligent
        </footer>
      </div>
    </div>
  );
}