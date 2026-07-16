import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";

const ADMIN_ROLES = ["Admin M-IA", "DSI / RSSI", "Superviseur support", "Agent support"];

export default function RequireAdmin({ children }) {
  const { user } = useAuth();
  const isAdmin = ADMIN_ROLES.includes(user?.role);
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}