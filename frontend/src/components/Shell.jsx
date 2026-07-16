import React, { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  ShieldCheck, LayoutDashboard, LifeBuoy, Bot, Ticket, BarChart3,
  Settings, LogOut, Bell, Cog, Menu, X
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import "./Shell.css";

const ADMIN_ROLES = ["Admin M-IA", "DSI / RSSI", "Superviseur support", "Agent support"];

function isAdmin(role) {
  return ADMIN_ROLES.includes(role);
}

const ALL_NAV_ITEMS = [
  { to: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard, adminOnly: false },
  { to: "/tickets-all", label: "Support & Tickets", icon: LifeBuoy, adminOnly: true },
  { to: "/chat", label: "Assistant IA", icon: Bot, adminOnly: false },
  { to: "/tickets", label: "Mes tickets", icon: Ticket, adminOnly: false },
  { to: "/budget", label: "Suivi budgétaire", icon: BarChart3, adminOnly: true },
  { to: "/admin", label: "Administration", icon: Settings, adminOnly: true },
];

export default function Shell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const userIsAdmin = isAdmin(user?.role);

  // Filter nav items based on role
  const NAV_ITEMS = ALL_NAV_ITEMS.filter(item => !item.adminOnly || userIsAdmin);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  // Determine current page title from location
  const pageTitle = NAV_ITEMS.find(item => {
    if (item.match) {
      return location.pathname.startsWith(item.match);
    }
    return location.pathname === item.to;
  })?.label || "Tableau de bord";

  return (
    <div className="shell">
      {sidebarOpen && <div className="shell__overlay" onClick={closeSidebar} />}

      <aside className={"shell__sidebar" + (sidebarOpen ? " shell__sidebar--open" : "")}>
        <div className="shell__brand">
          <div className="shell__brand-logo">
            <ShieldCheck size={20} strokeWidth={2.5} />
          </div>
          <div className="shell__brand-text">
            <div className="shell__brand-name">M-AUTOMOTIV</div>
            <div className="shell__brand-version">v1.0.0</div>
          </div>
        </div>
        <div className="shell__brand-subtitle">Plateforme Intelligente d'Assistance</div>

        <div className="shell__user-block">
          <div className="shell__user-avatar">{user?.name?.[0] || "U"}</div>
          <div className="shell__user-info">
            <span className="shell__user-name">{user?.name || "Utilisateur"}</span>
            <span className="shell__user-role-badge">{user?.role || "USER"}</span>
          </div>
        </div>

        <nav className="shell__nav">
          {NAV_ITEMS.map(({ to, label, icon: Icon, match }) => {
            const isActive = match ? location.pathname.startsWith(match) : location.pathname === to;
            const isTicketsActive = location.pathname.startsWith("/tickets");
            const isTicketsItem = label === "Support & Tickets" || label === "Mes tickets";

            return (
              <NavLink
                key={label}
                to={to}
                onClick={closeSidebar}
                className={"shell__nav-item" + ((isTicketsActive && isTicketsItem) ? " shell__nav-item--active" : isActive ? " shell__nav-item--active" : "")}
              >
                <Icon size={18} strokeWidth={1.8} />
                <span>{label}</span>
                {((isTicketsActive && isTicketsItem) || isActive) && <span className="shell__nav-dot" />}
              </NavLink>
            );
          })}
        </nav>

        <div className="shell__footer">
          <button className="shell__logout" onClick={handleLogout}>
            <LogOut size={16} strokeWidth={1.8} /> Se déconnecter
          </button>
        </div>
      </aside>

      <div className="shell__main-area">
        <header className="shell__topbar">
          <div className="shell__topbar-left">
            <button
              className="shell__hamburger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Ouvrir le menu"
            >
              <Menu size={20} />
            </button>
            <span className="shell__topbar-title">{pageTitle}</span>
          </div>
          <div className="shell__topbar-right">
            <button className="shell__topbar-icon-btn" aria-label="Notifications">
              <Bell size={18} strokeWidth={1.8} />
            </button>
            <button className="shell__topbar-icon-btn" aria-label="Paramètres">
              <Cog size={18} strokeWidth={1.8} />
            </button>
          </div>
        </header>
        <main className="shell__content">{children}</main>
      </div>
    </div>
  );
}