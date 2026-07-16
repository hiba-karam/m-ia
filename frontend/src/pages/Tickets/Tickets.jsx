import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  Inbox, Zap, Plus, Search, Eye, Trash2,
  ChevronLeft, ChevronRight, X
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { listTickets } from "../../services/api/client";
import "./Tickets.css";

const STATUS_OPTIONS = ["Ouvert", "En attente", "Fermé", "Résolu"];
const PRIORITY_OPTIONS = ["Basse", "Moyenne", "Haute", "Critique"];
const CATEGORY_OPTIONS = [
  "Problème technique",
  "Facturation",
  "Gestion de compte",
  "Demande de fonctionnalité",
  "Autre"
];

const PRIORITY_COLORS = {
  "Basse": { color: "var(--text-2)" },
  "Moyenne": { color: "var(--color-brand-orange)" },
  "Haute": { color: "var(--color-brand-orange-hover)" },
  "Critique": { color: "var(--color-brand-orange-hover)" },
};

const STATUS_COLORS = {
  "Ouvert": { bg: "#dbeafe", text: "#2563eb" },
  "En attente": { bg: "#fde3d8", text: "#f2643c" },
  "Fermé": { bg: "#e5e7eb", text: "#6b7280" },
  "Résolu": { bg: "#dcf3ec", text: "#1f8a70" },
};

export default function Tickets() {
  const { user } = useAuth();
  const location = useLocation();
  const isMyTickets = location.pathname === "/tickets";
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterAssign, setFilterAssign] = useState("");
  const [filterStatusCard, setFilterStatusCard] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [detailTicket, setDetailTicket] = useState(null);
  const [newTicket, setNewTicket] = useState({
    subject: "", description: "", category: "Problème technique", priority: "Moyenne"
  });

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    setLoading(true);
    listTickets().then((data) => {
      const transformed = data.map((t, i) => ({
        id: t.id || `TICK-${String(i + 1).padStart(4, "0")}`,
        subject: t.subject || "Sujet du ticket",
        subCategory: t.subCategory || t.category || "Général",
        status: ["Ouvert", "En attente", "Fermé", "Résolu"][["Créé", "À qualifier", "Résolu", "Fermé"].indexOf(t.status) >= 0 ? ["Créé", "À qualifier", "Résolu", "Fermé"].indexOf(t.status) : 0],
        priority: t.priority || "Moyenne",
        assignedTo: t.assignedTo || t.requester || "Non assigné",
        requestedBy: t.requester || user?.name || "",
        createdAt: t.createdAt || t.receivedAt || "2024-01-01",
        description: t.emailBody || "",
      }));
      setTickets(transformed);
      setLoading(false);
    });
  }, []);

  // On "Mes tickets", filter to show only tickets created by the current user
  const userFilteredTickets = isMyTickets
    ? tickets.filter(t => {
        const userName = user?.name?.toLowerCase() || "";
        const userEmail = user?.email?.toLowerCase() || "";
        const requester = (t.requestedBy || "").toLowerCase();
        const assignee = (t.assignedTo || "").toLowerCase();
        return requester.includes(userName) || requester.includes(userEmail) || assignee.includes(userName);
      })
    : tickets;

  const filtered = userFilteredTickets.filter(t => {
    const s = search.trim().toLowerCase();

    const matchSearch =
      !s ||
      t.id.toLowerCase().includes(s) ||
      t.subject.toLowerCase().includes(s) ||
      (t.assignedTo || "").toLowerCase().includes(s);

    const matchPriority = !filterPriority || t.priority === filterPriority;
    const matchAssign = !filterAssign || t.assignedTo === filterAssign;
    const matchStatusCard = !filterStatusCard || t.status === filterStatusCard;

    return matchSearch && matchPriority && matchAssign && matchStatusCard;
  });


  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const pageTickets = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // On "Mes tickets" show stats for user's own tickets, otherwise show all
  const statsSource = isMyTickets ? userFilteredTickets : tickets;
  const stats = {
    all: statsSource.length,
    open: statsSource.filter(t => t.status === "Ouvert").length,
    inProgress: statsSource.filter(t => t.status === "En attente").length,
    solved: statsSource.filter(t => t.status === "Résolu").length,
  };

  function handleStatusCardClick(status) {
    setFilterStatusCard(prev => (prev === status ? "" : status));
    setCurrentPage(1);
  }

  function handleCreateTicket(e) {
    e.preventDefault();
    const ticketsForNumber = isMyTickets ? userFilteredTickets : tickets;
    const nextNumber = ticketsForNumber.reduce((max, t) => {
      const m = String(t.id || "").match(/(\d+)/);
      return Math.max(max, m ? Number(m[1]) : 0);
    }, 0) + 1;

    const newId = `TKT-${String(nextNumber).padStart(4, "0")}`;
    const createdAt = new Date().toISOString().split("T")[0];

    setTickets([
      {
        id: newId,
        subject: newTicket.subject,
        subCategory: newTicket.category,
        status: "Ouvert",
        priority: newTicket.priority,
        assignedTo: "Non assigné",
        createdAt,
        description: newTicket.description,
      },
      ...tickets,
    ]);

    setShowModal(false);
    setNewTicket({
      subject: "",
      description: "",
      category: "Problème technique",
      priority: "Moyenne",
    });

    setSearch("");
    setFilterPriority("");
    setFilterAssign("");
    setFilterStatusCard("");
    setCurrentPage(1);
  }

  function handleDeleteTicket(id) {
    const ok = window.confirm("Supprimer ce ticket ?");
    if (!ok) return;
    setTickets(prev => prev.filter(x => x.id !== id));
  }

  function handleResetFilters() {
    setSearch("");
    setFilterPriority("");
    setFilterAssign("");
    setFilterStatusCard("");
    setCurrentPage(1);
  }

  const uniqueAssignees = [...new Set(statsSource.map(t => t.assignedTo).filter(Boolean))];

  const hasActiveFilters = search || filterPriority || filterAssign || filterStatusCard;

  // Loading state
  if (loading) {
    return (
      <div className="tickets">
        <div className="tickets__header">
          <div>
            <h1>Gestion des Tickets</h1>
            <p>Gérez et suivez tous les tickets d'assistance</p>
          </div>
        </div>
        <div className="tickets__loading">
          <div className="tickets__loading-spinner" />
          <p>Chargement des tickets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tickets">
      <div className="tickets__header">
        <div>
          <h1>Gestion des Tickets</h1>
          <p>Gérez et suivez tous les tickets d'assistance</p>
        </div>
        <button className="tickets__btn-new" onClick={() => setShowModal(true)}>
          <Plus size={16} strokeWidth={2.5} /> + Nouveau Ticket
        </button>

      </div>

      <div className="tickets__stats">
        <div
          className={"tickets__stat" + (filterStatusCard === "" ? " tickets__stat--active" : "")}
          onClick={() => handleStatusCardClick("")}
        >
          <span className="tickets__stat-value">{stats.all}</span>
          <span className="tickets__stat-label">Tous</span>
        </div>
        <div
          className={"tickets__stat" + (filterStatusCard === "Ouvert" ? " tickets__stat--active" : "")}
          onClick={() => handleStatusCardClick("Ouvert")}
        >
          <span className="tickets__stat-value">{stats.open}</span>
          <span className="tickets__stat-label">Ouverts</span>
        </div>
        <div
          className={"tickets__stat" + (filterStatusCard === "En attente" ? " tickets__stat--active" : "")}
          onClick={() => handleStatusCardClick("En attente")}
        >
          <span className="tickets__stat-value">{stats.inProgress}</span>
          <span className="tickets__stat-label">En cours</span>
        </div>
        <div
          className={"tickets__stat" + (filterStatusCard === "Résolu" ? " tickets__stat--active" : "")}
          onClick={() => handleStatusCardClick("Résolu")}
        >
          <span className="tickets__stat-value">{stats.solved}</span>
          <span className="tickets__stat-label">Résolus</span>
        </div>
      </div>


      <div className="tickets__toolbar">
        <div className="tickets__search">
          <Search size={15} className="tickets__search-icon" />
          <input
            type="text"
            placeholder="Rechercher par ID, sujet ou assigné..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <select
          className="tickets__select"
          value={filterPriority}
          onChange={(e) => { setFilterPriority(e.target.value); setCurrentPage(1); }}
        >
          <option value="">Toutes priorités</option>
          {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <select
          className="tickets__select"
          value={filterAssign}
          onChange={(e) => { setFilterAssign(e.target.value); setCurrentPage(1); }}
        >
          <option value="">Tous assignés</option>
          {uniqueAssignees.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div className="tickets__table-wrapper">
        {pageTickets.length > 0 ? (
          <table className="tickets__table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Sujet</th>
                <th>Statut</th>
                <th>Priorité</th>
                <th>Assigné à</th>
                <th>Créé le</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageTickets.map((t) => (
                <tr key={t.id}>
                  <td className="tickets__cell-id">{t.id}</td>
                  <td>
                    <div className="tickets__cell-subject">{t.subject}</div>
                    <div className="tickets__cell-subcategory">{t.subCategory}</div>
                  </td>
                  <td>
                    <span
                      className="tickets__status-badge"
                      style={{
                        background: STATUS_COLORS[t.status]?.bg || "#e5e7eb",
                        color: STATUS_COLORS[t.status]?.text || "#6b7280",
                      }}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td>
                    <span className="tickets__priority" style={{ color: PRIORITY_COLORS[t.priority]?.color || "#6b7280" }}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="tickets__cell-assign">{t.assignedTo}</td>
                  <td className="tickets__cell-date">{t.createdAt}</td>
                  <td>
                    <div className="tickets__actions">
                      <button
                        className="tickets__action-btn"
                        title="Voir"
                        onClick={() => setDetailTicket(t)}
                      >
                        <Eye size={15} />
                      </button>

                      <button
                        className="tickets__action-btn tickets__action-btn--delete"
                        title="Supprimer"
                        onClick={() => handleDeleteTicket(t.id)}
                      >
                        <Trash2 size={15} />
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="tickets__empty">
            <Inbox size={40} strokeWidth={1.5} />
            {hasActiveFilters ? (
              <>
                <h3>Aucun ticket ne correspond à votre recherche</h3>
                <p>Essayez de modifier vos filtres ou votre recherche.</p>
                <button className="tickets__btn-reset" onClick={handleResetFilters}>
                  Réinitialiser les filtres
                </button>
              </>
            ) : (
              <>
                <h3>Aucun ticket pour le moment</h3>
                <p>Les tickets créés apparaîtront ici.</p>
              </>
            )}
          </div>
        )}
      </div>

      {totalPages > 1 && pageTickets.length > 0 && (
        <div className="tickets__pagination">
          <span className="tickets__pagination-info">
            Page {currentPage} sur {totalPages} ({filtered.length} tickets)
          </span>
          <div className="tickets__pagination-buttons">
            <button
              className="tickets__page-btn"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft size={15} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                className={"tickets__page-btn" + (p === currentPage ? " tickets__page-btn--active" : "")}
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              className="tickets__page-btn"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Modal Détail Ticket */}
      {detailTicket && (
        <div className="tickets__modal-overlay" onClick={() => setDetailTicket(null)}>
          <div className="tickets__modal tickets__modal--detail" onClick={(e) => e.stopPropagation()}>
            <div className="tickets__modal-header">
              <h2 className="tickets__modal-title">{detailTicket.id}</h2>
              <button className="tickets__modal-close" onClick={() => setDetailTicket(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="tickets__modal-body">
              <div className="tickets__detail-row">
                <strong>Sujet :</strong> {detailTicket.subject}
              </div>
              <div className="tickets__detail-row">
                <strong>Catégorie :</strong> {detailTicket.subCategory}
              </div>
              <div className="tickets__detail-row">
                <strong>Statut :</strong>{" "}
                <span
                  className="tickets__status-badge"
                  style={{
                    background: STATUS_COLORS[detailTicket.status]?.bg || "#e5e7eb",
                    color: STATUS_COLORS[detailTicket.status]?.text || "#6b7280",
                  }}
                >
                  {detailTicket.status}
                </span>
              </div>
              <div className="tickets__detail-row">
                <strong>Priorité :</strong> {detailTicket.priority}
              </div>
              <div className="tickets__detail-row">
                <strong>Assigné à :</strong> {detailTicket.assignedTo}
              </div>
              <div className="tickets__detail-row">
                <strong>Créé le :</strong> {detailTicket.createdAt}
              </div>
              {detailTicket.description && (
                <div className="tickets__detail-row">
                  <strong>Description :</strong>
                  <p className="tickets__detail-desc">{detailTicket.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Nouveau Ticket */}
      {showModal && (
        <div className="tickets__modal-overlay" onClick={() => setShowModal(false)}>
          <div className="tickets__modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="tickets__modal-title">Nouveau Ticket</h2>

            <form onSubmit={handleCreateTicket} className="tickets__modal-form">
              <div className="tickets__modal-field">
                <label>Sujet</label>
                <input
                  type="text"
                  placeholder="Titre du ticket"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                  required
                />
              </div>

              <div className="tickets__modal-field">
                <label>Description</label>
                <textarea
                  placeholder="Décrivez le problème..."
                  rows={4}
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  required
                />
              </div>

              <div className="tickets__modal-row">
                <div className="tickets__modal-field">
                  <label>Catégorie</label>
                  <select
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                  >
                    {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="tickets__modal-field">
                  <label>Priorité</label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value })}
                  >
                    {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="tickets__modal-actions">
                <button
                  type="button"
                  className="tickets__modal-btn tickets__modal-btn--cancel"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </button>
                <button type="submit" className="tickets__modal-btn tickets__modal-btn--submit">
                  Créer le ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}