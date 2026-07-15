import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Bot, Ticket, ArrowRight } from "lucide-react";
import "./Dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      <div className="dashboard__welcome">
        <h1>
          Bienvenue, <span className="dashboard__welcome-name">{user?.name || "Utilisateur"}</span>
        </h1>
        <p className="dashboard__subtitle">Que souhaitez-vous faire ?</p>
      </div>

      <div className="dashboard__cards">
        <div className="dashboard__card" onClick={() => navigate("/chat")}>
          <div className="dashboard__card-icon dashboard__card-icon--orange">
            <Bot size={28} strokeWidth={1.8} />
          </div>
          <h3 className="dashboard__card-title">Assistant IA</h3>
          <p className="dashboard__card-desc">
            Interface Claude/ChatGPT : conversations, bulles, sélecteur de modèle, upload de fichiers, quota de tokens.
          </p>
          <span className="dashboard__card-link">
            Accéder <ArrowRight size={14} strokeWidth={2} />
          </span>
        </div>

        <div className="dashboard__card" onClick={() => navigate("/tickets")}>
          <div className="dashboard__card-icon dashboard__card-icon--teal">
            <Ticket size={28} strokeWidth={1.8} />
          </div>
          <h3 className="dashboard__card-title">Gestion des tickets</h3>
          <p className="dashboard__card-desc">
            Liste des tickets, filtres, détails, création et suivi.
          </p>
          <span className="dashboard__card-link">
            Accéder <ArrowRight size={14} strokeWidth={2} />
          </span>
        </div>
      </div>
    </div>
  );
}