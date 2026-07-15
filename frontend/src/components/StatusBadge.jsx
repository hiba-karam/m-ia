import React from "react";
import "./StatusBadge.css";

/**
 * Badge de statut coloré — jamais de texte de statut sans badge.
 * Créé = teal, À qualifier = amber, Rejeté = red.
 */
export default function StatusBadge({ status }) {
  const zone =
    status === "Créé" ? "teal" :
    status === "À qualifier" ? "amber" :
    status === "Rejeté" ? "red" : "teal";

  return (
    <span className={`status-badge status-badge--${zone}`}>{status}</span>
  );
}