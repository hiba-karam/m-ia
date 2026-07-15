import React, { useState, useEffect } from "react";
import {
  Ticket, Users, CheckCircle, UserCheck,
  Search, Plus, Edit3, Trash2, Star
} from "lucide-react";
import { listTickets } from "../../services/api/client";
import "./Admin.css";

const ADMIN_TABS = [
  { id: "overview", label: "Vue d'ensemble" },
  { id: "users", label: "Utilisateurs" },
  { id: "agents", label: "Agents" },
  { id: "all-tickets", label: "Tous les tickets" },
  { id: "settings", label: "Paramètres" },
];

const INITIAL_USERS = [
  { email: "admin@mia.local", role: "Admin", status: "Actif", tickets: 47, createdAt: "2024-01-15" },
  { email: "agent@mia.local", role: "Agent", status: "Actif", tickets: 23, createdAt: "2024-02-01" },
  { email: "jean.dupont@mia.local", role: "Agent", status: "Actif", tickets: 12, createdAt: "2024-03-10" },
  { email: "marie.curie@mia.local", role: "Agent", status: "Inactif", tickets: 8, createdAt: "2024-04-05" },
];

const INITIAL_AGENTS = [
  { name: "Jean Dupont", resolved: 15, avgTime: "2.3h", rating: 4.5 },
  { name: "Marie Curie", resolved: 12, avgTime: "3.1h", rating: 4.2 },
  { name: "Pierre Martin", resolved: 8, avgTime: "1.8h", rating: 4.8 },
];

const STATUS_BADGE_STYLES = {
  "Actif": { bg: "#dcf3ec", color: "#1f8a70" },
  "Inactif": { bg: "#fbe2e0", color: "#d6524b" },
};

export default function Admin() {
  const [tab, setTab] = useState("overview");
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState(INITIAL_USERS);
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [userSearch, setUserSearch] = useState("");
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ email: "", password: "", role: "Agent" });
  const [settings, setSettings] = useState({
    appName: "M-IA Support",
    contactEmail: "support@m-automotiv.ma",
    language: "fr",
    emailNotifications: true,
    urgentAlerts: true,
    weeklyReports: false,
  });

  // Ticket status edit
  const [editingStatus, setEditingStatus] = useState(null);

  useEffect(() => {
    listTickets().then((data) => {
      const transformed = data.map((t, i) => ({
        id: t.id || `TICK-${String(i + 1).padStart(4, "0")}`,
        subject: t.subject || "Sujet du ticket",
        status: t.status === "Créé" || t.status === "À qualifier" ? "Ouvert" : t.status === "Résolu" ? "Résolu" : "Ouvert",
        priority: t.priority || "Moyenne",
        assignedTo: t.assignedTo || t.requester || "Non assigné",
        createdBy: t.requester || "Utilisateur",
      }));
      setTickets(transformed);
    });
  }, []);

  const allTickets = tickets;
  const openTickets = tickets.filter(t => t.status === "Ouvert");
  const resolvedThisMonth = tickets.filter(t => t.status === "Résolu").length;

  const filteredUsers = users.filter(u =>
    !userSearch || u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  function handleAddUser(e) {
    e.preventDefault();
    setUsers([{
      email: newUser.email,
      role: newUser.role,
      status: "Actif",
      tickets: 0,
      createdAt: new Date().toISOString().split("T")[0],
    }, ...users]);
    setShowAddUser(false);
    setNewUser({ email: "", password: "", role: "Agent" });
  }

  function handleStatusChange(ticketId, newStatus) {
    setTickets(tickets.map(t =>
      t.id === ticketId ? { ...t, status: newStatus } : t
    ));
    setEditingStatus(null);
  }

  function handleSaveSettings(type) {
    // Placeholder - would save to backend
    alert("Paramètres sauvegardés !");
  }

  return (
    <div className="admin">
      <div className="admin__intro">
        <h1>Administration</h1>
        <p>Gestion complète de l'application</p>
      </div>

      <div className="admin__tabs">
        {ADMIN_TABS.map(t => (
          <button
            key={t.id}
            className={"admin__tab" + (tab === t.id ? " admin__tab--active" : "")}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ════════════════════ VUE D'ENSEMBLE ════════════════════ */}
      {tab === "overview" && (
        <div className="admin__overview">
          <div className="admin__kpis">
            <div className="admin__kpi">
              <div className="admin__kpi-icon admin__kpi-icon--tickets">
                <Ticket size={18} />
              </div>
              <div className="admin__kpi-info">
                <span className="admin__kpi-value">{allTickets.length}</span>
                <span className="admin__kpi-label">Total tickets</span>
              </div>
            </div>
            <div className="admin__kpi">
              <div className="admin__kpi-icon admin__kpi-icon--open">
                <Ticket size={18} />
              </div>
              <div className="admin__kpi-info">
                <span className="admin__kpi-value">{openTickets.length}</span>
                <span className="admin__kpi-label">Tickets ouverts</span>
              </div>
            </div>
            <div className="admin__kpi">
              <div className="admin__kpi-icon admin__kpi-icon--resolved">
                <CheckCircle size={18} />
              </div>
              <div className="admin__kpi-info">
                <span className="admin__kpi-value">{resolvedThisMonth}</span>
                <span className="admin__kpi-label">Résolus ce mois</span>
              </div>
            </div>
            <div className="admin__kpi">
              <div className="admin__kpi-icon admin__kpi-icon--users">
                <UserCheck size={18} />
              </div>
              <div className="admin__kpi-info">
                <span className="admin__kpi-value">{users.length}</span>
                <span className="admin__kpi-label">Utilisateurs actifs</span>
              </div>
            </div>
          </div>

          <div className="admin__overview-row">
            <div className="admin__card">
              <h3 className="admin__card-title">Statistiques agents</h3>
              {agents.map(a => (
                <div key={a.name} className="admin__agent-stat-row">
                  <div className="admin__agent-stat-name">{a.name}</div>
                  <div className="admin__agent-stat-details">
                    <span>{a.resolved} résolus</span>
                    <span className="admin__agent-stat-time">{a.avgTime}</span>
                  </div>
                  <div className="admin__agent-stat-rating">
                    <Star size={12} fill="currentColor" />
                    <span>{a.rating}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="admin__card">
              <h3 className="admin__card-title">Répartition des tickets</h3>
              <div className="admin__distribution">
                <div className="admin__dist-row">
                  <span className="admin__dist-label">Ouverts</span>
                  <div className="admin__dist-bar-track">
                    <div className="admin__dist-bar-fill admin__dist-bar-fill--blue" style={{ width: `${openTickets.length ? (openTickets.length / Math.max(allTickets.length, 1)) * 100 : 0}%` }} />
                  </div>
                  <span className="admin__dist-count">{openTickets.length}</span>
                </div>
                <div className="admin__dist-row">
                  <span className="admin__dist-label">En cours</span>
                  <div className="admin__dist-bar-track">
                    <div className="admin__dist-bar-fill admin__dist-bar-fill--orange" style={{ width: "15%" }} />
                  </div>
                  <span className="admin__dist-count">5</span>
                </div>
                <div className="admin__dist-row">
                  <span className="admin__dist-label">Résolus</span>
                  <div className="admin__dist-bar-track">
                    <div className="admin__dist-bar-fill admin__dist-bar-fill--green" style={{ width: `${resolvedThisMonth ? (resolvedThisMonth / Math.max(allTickets.length, 1)) * 100 : 0}%` }} />
                  </div>
                  <span className="admin__dist-count">{resolvedThisMonth}</span>
                </div>
                <div className="admin__dist-row">
                  <span className="admin__dist-label">Fermés</span>
                  <div className="admin__dist-bar-track">
                    <div className="admin__dist-bar-fill admin__dist-bar-fill--gray" style={{ width: "8%" }} />
                  </div>
                  <span className="admin__dist-count">3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════ UTILISATEURS ════════════════════ */}
      {tab === "users" && (
        <div className="admin__users">
          <div className="admin__users-toolbar">
            <div className="admin__users-search">
              <Search size={15} className="admin__users-search-icon" />
              <input
                type="text"
                placeholder="Rechercher par email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>
            <button className="admin__btn-add" onClick={() => setShowAddUser(true)}>
              <Plus size={16} strokeWidth={2.5} /> Ajouter
            </button>
          </div>

          <div className="admin__table-wrapper">
            <table className="admin__table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th>Tickets</th>
                  <th>Créé le</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u, i) => (
                  <tr key={i}>
                    <td className="admin__cell-email">{u.email}</td>
                    <td>
                      <span className={`admin__role-badge admin__role-badge--${u.role.toLowerCase()}`}>
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span
                        className="admin__status-badge"
                        style={{
                          background: STATUS_BADGE_STYLES[u.status]?.bg || "#e5e7eb",
                          color: STATUS_BADGE_STYLES[u.status]?.color || "#6b7280",
                        }}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="admin__cell-tickets">{u.tickets}</td>
                    <td className="admin__cell-date">{u.createdAt}</td>
                    <td>
                      <div className="admin__actions">
                        <button className="admin__action-btn" title="Modifier">
                          <Edit3 size={14} />
                        </button>
                        <button className="admin__action-btn admin__action-btn--delete" title="Supprimer">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════════════ TOUS LES TICKETS ════════════════════ */}
      {tab === "all-tickets" && (
        <div className="admin__all-tickets">
          <div className="admin__table-wrapper">
            <table className="admin__table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Sujet</th>
                  <th>Statut</th>
                  <th>Assigné à</th>
                  <th>Créé par</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allTickets.map(t => (
                  <tr key={t.id}>
                    <td className="admin__cell-id">{t.id}</td>
                    <td className="admin__cell-subject">{t.subject}</td>
                    <td>
                      {editingStatus === t.id ? (
                        <select
                          className="admin__status-select"
                          value={t.status}
                          onChange={(e) => handleStatusChange(t.id, e.target.value)}
                          onBlur={() => setEditingStatus(null)}
                          autoFocus
                        >
                          <option value="Ouvert">Ouvert</option>
                          <option value="En attente">En attente</option>
                          <option value="Résolu">Résolu</option>
                          <option value="Fermé">Fermé</option>
                        </select>
                      ) : (
                        <span
                          className="admin__status-badge admin__status-badge--clickable"
                          onClick={() => setEditingStatus(t.id)}
                          style={{
                            background: t.status === "Ouvert" ? "#dbeafe" : t.status === "En attente" ? "#fde3d8" : t.status === "Résolu" ? "#dcf3ec" : "#e5e7eb",
                            color: t.status === "Ouvert" ? "#2563eb" : t.status === "En attente" ? "#f2643c" : t.status === "Résolu" ? "#1f8a70" : "#6b7280",
                          }}
                        >
                          {t.status}
                        </span>
                      )}
                    </td>
                    <td className="admin__cell-assign">{t.assignedTo}</td>
                    <td className="admin__cell-creator">{t.createdBy}</td>
                    <td>
                      <button className="admin__btn-assign">
                        {t.assignedTo !== "Non assigné" ? "Changer assignation" : "Assigner"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════════════ PARAMÈTRES ════════════════════ */}
      {tab === "settings" && (
        <div className="admin__settings">
          <div className="admin__settings-row">
            <div className="admin__card">
              <h3 className="admin__card-title">Configuration générale</h3>
              <div className="admin__settings-form">
                <div className="admin__settings-field">
                  <label>Nom de l'application</label>
                  <input
                    type="text"
                    value={settings.appName}
                    onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
                  />
                </div>
                <div className="admin__settings-field">
                  <label>Email de contact</label>
                  <input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                  />
                </div>
                <div className="admin__settings-field">
                  <label>Langue par défaut</label>
                  <select
                    value={settings.language}
                    onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  >
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>
                <button className="admin__btn-save" onClick={() => handleSaveSettings("general")}>
                  Sauvegarder
                </button>
              </div>
            </div>

            <div className="admin__card">
              <h3 className="admin__card-title">Notifications</h3>
              <div className="admin__settings-checkboxes">
                <label className="admin__checkbox">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => setSettings({ ...settings, emailNotifications: e.target.checked })}
                  />
                  <span>Notifications email</span>
                </label>
                <label className="admin__checkbox">
                  <input
                    type="checkbox"
                    checked={settings.urgentAlerts}
                    onChange={(e) => setSettings({ ...settings, urgentAlerts: e.target.checked })}
                  />
                  <span>Alertes tickets urgents</span>
                </label>
                <label className="admin__checkbox">
                  <input
                    type="checkbox"
                    checked={settings.weeklyReports}
                    onChange={(e) => setSettings({ ...settings, weeklyReports: e.target.checked })}
                  />
                  <span>Rapports hebdomadaires</span>
                </label>
              </div>
              <button className="admin__btn-save" onClick={() => handleSaveSettings("notifications")}>
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════ MODAL AJOUTER UTILISATEUR ════════════════════ */}
      {showAddUser && (
        <div className="admin__modal-overlay" onClick={() => setShowAddUser(false)}>
          <div className="admin__modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="admin__modal-title">Ajouter un utilisateur</h2>
            <form onSubmit={handleAddUser} className="admin__modal-form">
              <div className="admin__modal-field">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="email@exemple.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
              </div>
              <div className="admin__modal-field">
                <label>Mot de passe</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                />
              </div>
              <div className="admin__modal-field">
                <label>Rôle</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="Admin">Admin</option>
                  <option value="Agent">Agent</option>
                  <option value="User">User</option>
                </select>
              </div>
              <div className="admin__modal-actions">
                <button
                  type="button"
                  className="admin__modal-btn admin__modal-btn--cancel"
                  onClick={() => setShowAddUser(false)}
                >
                  Annuler
                </button>
                <button type="submit" className="admin__modal-btn admin__modal-btn--submit">
                  Créer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}