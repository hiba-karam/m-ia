// Façade API frontend.
//
// Chaque fonction ci-dessous simule aujourd'hui un appel réseau (délai + données mockées).
// Quand le backend Node.js/Express sera prêt, il suffira de remplacer le corps de chaque
// fonction par un vrai fetch() vers l'endpoint correspondant (voir section 12 du business plan) :
//
//   checkTokenQuota()   -> POST /api/token/check
//   getTokenUsage()     -> GET  /api/token/usage
//   listTickets()       -> GET  /api/msupport/tickets
//   sendChatMessage()   -> POST /api/chat/messages
//   listProviders()     -> GET  /api/admin/providers
//   updateProvider()    -> PUT  /api/admin/providers
//   listQuotaProfiles() -> GET  /api/admin/quotas
//
// Toutes les fonctions sont asynchrones (Promise) dès maintenant, pour que le passage
// au vrai réseau ne change aucun appelant.

import {
  usageData, ticketsData, aiProviders, quotaProfiles,
  roleDefs, ssoMappings, mailboxSettings, chatSessions,
} from "./mockData";

const LATENCY = 400;

function delay(value, ms = LATENCY) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export async function getTokenUsage() {
  return delay({ series: usageData, remainingDailyTokens: 12600, dailyBudget: 20000 });
}

export async function checkTokenQuota({ estimatedInputTokens, estimatedOutputTokens }) {
  // TODO brancher sur POST /api/token/check une fois le backend disponible.
  return delay({
    allowed: true,
    selectedProvider: "Claude",
    selectedModel: "claude-compatible-model",
    remainingDailyTokens: 12600,
    remainingMonthlyBudget: 780.5,
    policyAction: "allow",
  });
}

export async function listChatSessions() {
  // GET /api/chat/sessions
  return delay(chatSessions);
}

export async function createChatSession() {
  // POST /api/chat/sessions
  return delay({ id: `cs-${Date.now()}`, title: "Nouvelle conversation", updatedAt: "à l'instant" });
}

export async function sendChatMessage({ text, model = "auto", attachment = null }) {
  // POST /api/chat/messages
  await checkTokenQuota({ estimatedInputTokens: 400, estimatedOutputTokens: 300 });
  const chosenModel = model === "auto" ? "Gemini" : model;
  const attachmentNote = attachment ? ` J'ai bien reçu le fichier « ${attachment.name} » et je peux l'analyser.` : "";
  return delay({
    model: chosenModel,
    useCase: attachment ? "Analyse de document" : "Analyse multimodale",
    text:
      "Requête reçue. Voici un exemple de réponse générée par le LLM Gateway — dans un environnement réel, ce message viendrait du modèle sélectionné selon la politique de coût et de confidentialité en vigueur." +
      attachmentNote,
  }, 700);
}

export async function listTickets() {
  return delay(ticketsData);
}

export async function listProviders() {
  return delay(aiProviders);
}

export async function updateProvider(name, changes) {
  // TODO brancher sur PUT /api/admin/providers
  return delay({ name, ...changes });
}

export async function listQuotaProfiles() {
  return delay(quotaProfiles);
}

export async function listRoles() {
  return delay({ roles: roleDefs, ssoMappings });
}

export async function getMailboxSettings() {
  return delay(mailboxSettings);
}
