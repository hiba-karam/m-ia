import React from "react";
import "./QuotaGauge.css";

/**
 * Jauge Token Guard à trois zones (teal / amber / red) reflétant
 * les seuils du business plan : 70 % (alerte), 90 % (restriction), 100 % (blocage).
 *
 * Utilisée sur le Dashboard (grand format) et dans le Chat (compact).
 */
export default function QuotaGauge({ label, used, budget, unit = "tokens", compact = false }) {
  const pct = Math.min(100, Math.round((used / budget) * 100));
  const zone = pct >= 90 ? "red" : pct >= 70 ? "amber" : "teal";
  const zoneLabel = { teal: "Nominal", amber: "Vigilance", red: pct >= 100 ? "Bloqué" : "Restriction" }[zone];

  return (
    <div className="quota-gauge">
      {!compact && (
        <div className="quota-gauge__head">
          <span className="quota-gauge__label">{label}</span>
          <span className={`quota-gauge__zone quota-gauge__zone--${zone}`}>{zoneLabel}</span>
        </div>
      )}
      <div className="quota-gauge__track">
        <div className="quota-gauge__tick" style={{ left: "70%" }} />
        <div className="quota-gauge__tick" style={{ left: "90%" }} />
        <div className={`quota-gauge__fill quota-gauge__fill--${zone}`} style={{ width: `${pct}%` }} />
      </div>
      {!compact && (
        <div className="quota-gauge__foot">
          <span>{used.toLocaleString("fr-FR")} / {budget.toLocaleString("fr-FR")} {unit}</span>
          <span>{pct}%</span>
        </div>
      )}
    </div>
  );
}