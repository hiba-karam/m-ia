// Données simulées, en attendant les vrais endpoints du backend M-IA.
// Les formes de données suivent les tables SQL Server et les exemples JSON
// décrits dans le business plan (sections 11 et 12).

export const usageData = [];

export const ticketsData = [];

export const aiProviders = [
  { name: "ChatGPT", usage: "Rédaction, synthèse, analyse structurée, usages généraux.", rule: "Autorisé selon quota et profil utilisateur.", enabled: true },
  { name: "Claude", usage: "Analyse longue, documents, rédaction professionnelle, raisonnement.", rule: "Modèle premium soumis à budget renforcé.", enabled: true },
  { name: "Gemini", usage: "Analyse multimodale et documents selon besoin.", rule: "Autorisé pour cas compatibles et coût maîtrisé.", enabled: true },
  { name: "DeepSeek", usage: "Analyse technique, code, raisonnement, coût potentiellement optimisé.", rule: "Disponible avec règles de confidentialité et validation DSI.", enabled: false },
  { name: "Kimi", usage: "Analyse de longs contextes et documents volumineux.", rule: "À activer selon coût, performance et conformité.", enabled: false },
];

export const quotaProfiles = [
  { profile: "Utilisateur standard", usage: "Chat, résumé, aide rédactionnelle.", policy: "Quota quotidien modéré, modèles premium limités.", daily: 8000 },
  { profile: "Agent support", usage: "Analyse tickets, réponses, diagnostic.", policy: "Quota plus élevé, accès prioritaire au flux M-support.", daily: 20000 },
  { profile: "Manager / DSI", usage: "Analyse documents, reporting, arbitrage.", policy: "Quota élevé avec visibilité coût.", daily: 30000 },
  { profile: "Admin IA", usage: "Paramétrage, supervision, exceptions.", policy: "Peut augmenter un quota avec justification.", daily: 40000 },
  { profile: "Automate M-support", usage: "Analyse emails officiels M-support.", policy: "Budget dédié, priorité haute, seuils surveillés.", daily: 15000 },
];

export const roleDefs = [
  { role: "Admin M-IA", rights: "Paramétrage global, fournisseurs IA, quotas, SSO, API M-support, logs." },
  { role: "DSI / RSSI", rights: "Supervision, audit, budgets, risques, tableaux de bord." },
  { role: "Superviseur support", rights: "Tickets à qualifier, erreurs API, priorités, reporting support." },
  { role: "Agent support", rights: "Validation ticket, correction catégorie, suivi erreurs, réponse utilisateur." },
  { role: "Utilisateur", rights: "Chat IA interne, upload documents selon quota, historique personnel." },
  { role: "Lecteur audit", rights: "Accès lecture aux logs et exports, sans modification." },
];

export const ssoMappings = [
  { group: "GRP-DSI-Admins", role: "Admin M-IA" },
  { group: "GRP-Support-N1", role: "Agent support" },
  { group: "GRP-Support-Superviseurs", role: "Superviseur support" },
  { group: "GRP-Tous-Collaborateurs", role: "Utilisateur" },
];

export const mailboxSettings = [
  ["Boîte surveillée", "support@entreprise.ma"],
  ["Méthode de connexion", "Microsoft Graph API"],
  ["Règle anti-doublon", "Message-ID + hash du contenu"],
  ["Statut connexion", "Actif"],
  ["Dernière synchronisation", "08/07/2026 09:14"],
];

export const modelTagColors = {
  Claude: { color: "#8b5fa8", bg: "#f1e9f7" },
  ChatGPT: { color: "#e2762e", bg: "#fceee1" },
  Gemini: { color: "#e2762e", bg: "#fceee1" },
};

export const chatSessions = [];
