// Données simulées, en attendant les vrais endpoints du backend M-IA.
// Les formes de données suivent les tables SQL Server et les exemples JSON
// décrits dans le business plan (sections 11 et 12).

export const usageData = [
  { day: "Lun", tokens: 12000 },
  { day: "Mar", tokens: 15400 },
  { day: "Mer", tokens: 11200 },
  { day: "Jeu", tokens: 18900 },
  { day: "Ven", tokens: 21300 },
  { day: "Sam", tokens: 6400 },
  { day: "Dim", tokens: 4100 },
];

export const ticketsData = [
  {
    id: "MS-10432", status: "Créé", conf: 0.91, dept: "Comptabilité",
    subject: "Problème accès Business Central", requester: "K. Amrani",
    email: "k.amrani@entreprise.ma", site: "Rabat", receivedAt: "08/07/2026 09:12",
    category: "Application", subCategory: "Business Central", priority: "Haute",
    impact: "Utilisateur bloqué", urgency: "Élevée", model: "Claude",
    emailBody: "Bonjour, depuis ce matin je n'arrive plus à me connecter à Business Central, le message d'erreur indique 'accès refusé'. C'est bloquant pour clôturer les écritures du mois. Merci de votre aide rapide.",
    summary: "Utilisateur bloqué sur Business Central suite à une erreur d'accès, impact sur la clôture mensuelle.",
    apiStatus: 201, ticketNo: "TCK-88213",
  },
  {
    id: "MS-10431", status: "Créé", conf: 0.87, dept: "RH",
    subject: "Demande accès VPN nouveau collaborateur", requester: "L. Idrissi",
    email: "l.idrissi@entreprise.ma", site: "Casablanca", receivedAt: "08/07/2026 08:47",
    category: "Accès", subCategory: "VPN", priority: "Moyenne",
    impact: "Nouveau collaborateur non opérationnel", urgency: "Moyenne", model: "ChatGPT",
    emailBody: "Bonjour, un nouveau collaborateur arrive lundi et a besoin d'un accès VPN pour le télétravail. Pouvez-vous créer son compte ? Je joins le formulaire RH.",
    summary: "Demande de création d'accès VPN pour un nouveau collaborateur, formulaire RH joint.",
    apiStatus: 201, ticketNo: "TCK-88210",
  },
  {
    id: "MS-10430", status: "À qualifier", conf: 0.62, dept: "Facilities",
    subject: "Imprimante réseau Rabat hors service", requester: "H. Fassi",
    email: "h.fassi@entreprise.ma", site: "Rabat", receivedAt: "08/07/2026 08:20",
    category: "Matériel", subCategory: "Imprimante", priority: "Basse",
    impact: "Gêne modérée", urgency: "Faible", model: "Gemini",
    emailBody: "L'imprimante du 2e étage n'imprime plus rien depuis hier, écran affiche un code erreur que je n'arrive pas à lire.",
    summary: "Panne imprimante réseau signalée, code erreur illisible — informations incomplètes.",
    apiStatus: null, ticketNo: null,
  },
  {
    id: "MS-10429", status: "Créé", conf: 0.94, dept: "Finance",
    subject: "Erreur export mensuel Sage", requester: "N. Tazi",
    email: "n.tazi@entreprise.ma", site: "Casablanca", receivedAt: "07/07/2026 17:03",
    category: "Application", subCategory: "Sage", priority: "Haute",
    impact: "Retard reporting mensuel", urgency: "Élevée", model: "Claude",
    emailBody: "L'export comptable mensuel vers Sage échoue avec une erreur de format sur les écritures d'amortissement. Le reporting doit partir demain matin.",
    summary: "Échec d'export comptable Sage sur les écritures d'amortissement, échéance de reporting proche.",
    apiStatus: 201, ticketNo: "TCK-88205",
  },
  {
    id: "MS-10428", status: "À qualifier", conf: 0.41, dept: "—",
    subject: "\"urgent svp aide\" — objet ambigu", requester: "Inconnu",
    email: "contact.ext92@mailbox.com", site: "—", receivedAt: "07/07/2026 16:44",
    category: "Non déterminé", subCategory: "—", priority: "Non déterminé",
    impact: "Non déterminé", urgency: "Non déterminé", model: "Gemini",
    emailBody: "urgent svp aide g un soucis",
    summary: "Contenu insuffisant pour déterminer la catégorie, le demandeur ou la priorité avec confiance.",
    apiStatus: null, ticketNo: null,
  },
];

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

export const chatSessions = [
  { id: "cs-1", title: "Résumé rapport Q2 comptabilité", updatedAt: "08/07/2026 09:40" },
  { id: "cs-2", title: "Aide rédaction email fournisseur", updatedAt: "07/07/2026 16:12" },
  { id: "cs-3", title: "Analyse contrat prestataire IT", updatedAt: "06/07/2026 11:05" },
];
