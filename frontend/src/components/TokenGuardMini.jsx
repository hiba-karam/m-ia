import React, { useEffect, useState } from "react";
import { getTokenUsage } from "../services/api/client";

/**
 * Mini-jauge TokenGuard pour la topbar.
 * Toujours visible — donne la consommation tokens en un coup d'œil.
 */
export default function TokenGuardMini() {
  const [quota, setQuota] = useState({ remainingDailyTokens: 12600, dailyBudget: 20000 });

  useEffect(() => {
    getTokenUsage().then((data) =>
      setQuota({ remainingDailyTokens: data.remainingDailyTokens, dailyBudget: data.dailyBudget })
    );
  }, []);

  const used = quota.dailyBudget - quota.remainingDailyTokens;
  const pct = Math.min(100, Math.round((used / quota.dailyBudget) * 100));
  const zone = pct >= 90 ? "red" : pct >= 70 ? "amber" : "teal";

  return (
    <div className="token-guard-mini" title={`${used.toLocaleString("fr-FR")} / ${quota.dailyBudget.toLocaleString("fr-FR")} tokens utilisés`}>
      <span className={`token-guard-mini__dot token-guard-mini__dot--${zone}`} />
      <div className="token-guard-mini__bar">
        <div className={`token-guard-mini__fill token-guard-mini__fill--${zone}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="token-guard-mini__text">{pct}%</span>
    </div>
  );
}