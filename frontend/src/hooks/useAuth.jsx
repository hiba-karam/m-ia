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

const MOCK_USER = {
  name: "S. Benali",
  role: "Agent support",
  service: "Support IT",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const loginSso = useCallback(() => {
    setUser(MOCK_USER);
  }, []);

  const loginLocal = useCallback((credentials) => {
    // TODO: POST /api/auth/login avec { username, password }
    setUser({ ...MOCK_USER, name: credentials?.username || "admin.local", role: "Admin M-IA" });
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

