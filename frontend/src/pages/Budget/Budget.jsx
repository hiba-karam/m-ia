import React from "react";
import { DollarSign } from "lucide-react";
import "./Budget.css";

export default function Budget() {
  return (
    <div className="budget">
      <div className="budget__intro">
        <h1>Suivi budgétaire</h1>
        <p>Analyse des coûts et consommation</p>
      </div>

      <div className="budget__placeholder">
        <div className="budget__placeholder-icon">
          <DollarSign size={28} strokeWidth={2} />
        </div>
        <h3 className="budget__placeholder-title">Analyse des coûts</h3>
        <p className="budget__placeholder-desc">
          Tableau de bord des coûts, graphiques de consommation, alertes de budget.
        </p>
      </div>
    </div>
  );
}