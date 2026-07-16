import React, { createContext, useContext, useState, useCallback } from "react";

/**
 * Contexte d'authentification.
 *
 * Pour l'instant, `loginSso()` et `loginLocal()` simulent une connexion réussie.
 * Quand le backend sera prêt, remplacer ces fonctions par de vrais appels :
 *   - loginSso()   -> redirection vers /api/auth/sso/callback (OIDC/SAML)
 *   - loginLocal() -> POST /api/auth/login puis stockage du token de session
 */
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const loginSso = useCallback(() => {
    setUser({
      name: "S. Benali",
      role: "Agent support",
      service: "Support IT",
    });
  }, []);

  const loginLocal = useCallback((credentials) => {
    const username = credentials?.username || "";
    const isAdmin = username === "admin@mia.local";
    setUser({
      name: isAdmin ? "Admin M-IA" : username === "agent@mia.local" ? "Agent Support" : username,
      role: isAdmin ? "Admin M-IA" : "Utilisateur",
      service: isAdmin ? "DSI" : "Support IT",
    });
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loginSso, loginLocal, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé à l'intérieur d'un <AuthProvider>");
  return ctx;
}

