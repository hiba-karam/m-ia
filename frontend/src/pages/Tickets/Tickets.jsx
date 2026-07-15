import React, { useState, useEffect } from "react";
import {
  Inbox, Zap, Plus, Search, Eye, Trash2,
  ChevronLeft, ChevronRight
} from "lucide-react";
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

const STATUS_COLORS = {
  "Ouvert": { bg: "#dbeafe", text: "#2563eb" },
  "En attente": { bg: "#fde3d8", text: "#f2643c" },
  "Fermé": { bg: "#e5e7eb", text: "#6b7280" },
  "Résolu": { bg: "#dcf3ec", text: "#1f8a70" },
};

const PRIORITY_COLORS = {
  "Basse": { color: "#6b7280" },
  "Moyenne": { color: "#f2643c" },
  "Haute": { color: "#d6524b" },
  "Critique": { color: "#b91c1c" },
};

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterAssign, setFilterAssign] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: "", description: "", category: "Problème technique", priority: "Moyenne"
  });

  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    listTickets().then((data) => {
      // Transform mock data into the expected format
      const transformed = data.map((t, i) => ({
        id: t.id || `TICK-${String(i + 1).padStart(4, "0")}`,
        subject: t.subject || "Sujet du ticket",
        subCategory: t.subCategory || t.category || "Général",
        status: ["Ouvert", "En attente", "Fermé", "Résolu"][["Créé", "À qualifier", "Résolu", "Fermé"].indexOf(t.status) >= 0 ? ["Créé", "À qualifier", "Résolu", "Fermé"].indexOf(t.status) : 0],
        priority: t.priority || "Moyenne",
        assignedTo: t.assignedTo || t.requester || "Non assigné",
        createdAt: t.createdAt || t.receivedAt || "2024-01-01",
      }));
      setTickets(transformed);
    });
  }, []);

  const filtered = tickets.filter(t => {
    const matchSearch = !search || 
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase()) ||
      (t.assignedTo && t.assignedTo.toLowerCase().includes(search.toLowerCase()));
    const matchPriority = !filterPriority || t.priority === filterPriority;
    const matchAssign = !filterAssign || t.assignedTo === filterAssign;
    return matchSearch && matchPriority && matchAssign;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const pageTickets = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const stats = {
    all: tickets.length,
    open: tickets.filter(t => t.status === "Ouvert").length,
    inProgress: tickets.filter(t => t.status === "En attente").length,
    solved: tickets.filter(t => t.status === "Résolu").length,
  };

  function handleCreateTicket(e) {
    e.preventDefault();
    const newId = `TICK-${String(tickets.length + 1).padStart(4, "0")}`;
    setTickets([{
      id: newId,
      subject: newTicket.subject,
      subCategory: newTicket.category,
      status: "Ouvert",
      priority: newTicket.priority,
      assignedTo: "Non assigné",
      createdAt: new Date().toISOString().split("T")[0],
    }, ...tickets]);
    setShowModal(false);
    setNewTicket({ subject: "", description: "", category: "Problème technique", priority: "Moyenne" });
  }

  const uniqueAssignees = [...new Set(tickets.map(t => t.assignedTo).filter(Boolean))];

  return (
    <div className="tickets">
      <div className="tickets__header">
        <div>
          <h1>Gestion des Tickets</h1>
          <p>Gérez et suivez tous les tickets d'assistance</p>
        </div>
        <button className="tickets__btn-new" onClick={() => setShowModal(true)}>
          <Plus size={16} strokeWidth={2.5} /> Nouveau Ticket
        </button>
      </div>

      <div className="tickets__stats">
        <div className="tickets__stat tickets__stat--active">
          <span className="tickets__stat-value">{stats.all}</span>
          <span className="tickets__stat-label">Tous</span>
        </div>
        <div className="tickets__stat">
          <span className="tickets__stat-value">{stats.open}</span>
          <span className="tickets__stat-label">Ouverts</span>
        </div>
        <div className="tickets__stat">
          <span className="tickets__stat-value">{stats.inProgress}</span>
          <span className="tickets__stat-label">En cours</span>
        </div>
        <div className="tickets__stat">
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
                    <button className="tickets__action-btn" title="Voir">
                      <Eye size={15} />
                    </button>
                    <button className="tickets__action-btn tickets__action-btn--delete" title="Supprimer">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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