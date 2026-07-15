import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./hooks/useAuth.jsx";
import ProtectedRoute from "./components/ProtectedRoute";
import Shell from "./components/Shell";
import Login from "./pages/Login/Login";
import Chat from "./pages/Chat/Chat";
import Dashboard from "./pages/Dashboard/Dashboard";
import Tickets from "./pages/Tickets/Tickets";
import Budget from "./pages/Budget/Budget";
import Admin from "./pages/Admin/Admin";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Shell>
                <Routes>
                  <Route path="chat" element={<Chat />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="tickets" element={<Tickets />} />
                  <Route path="budget" element={<Budget />} />
                  <Route path="admin" element={<Admin />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </Shell>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
