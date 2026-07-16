// Façade API frontend.
//
// Chaque fonction ci-dessous effectue un vrai fetch() vers le backend Express
// via le proxy Vite (/api -> http://localhost:5000).

const BASE_URL = '/api';

async function handleResponse(response) {
  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    let errorMessage;
    try {
      const errorJson = JSON.parse(errorBody);
      errorMessage = errorJson.message || errorJson.error || response.statusText;
    } catch {
      errorMessage = errorBody || response.statusText;
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

async function fetchJSON(url, options = {}) {
  const response = await fetch(`${BASE_URL}${url}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  return handleResponse(response);
}

// ─── Auth ────────────────────────────────────────────

export async function login({ username, password }) {
  return fetchJSON('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export async function loginSSO(provider = 'oidc') {
  window.location.href = `${BASE_URL}/auth/sso/${provider}`;
}

export async function refreshToken(token) {
  return fetchJSON('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken: token }),
  });
}

export async function logout() {
  return fetchJSON('/auth/logout', { method: 'POST' });
}

export async function getMe() {
  return fetchJSON('/auth/me');
}

// ─── Token / Quota ───────────────────────────────────

export async function getTokenUsage() {
  return fetchJSON('/token/usage');
}

export async function checkTokenQuota({ estimatedInputTokens, estimatedOutputTokens }) {
  return fetchJSON('/token/check', {
    method: 'POST',
    body: JSON.stringify({ estimatedInputTokens, estimatedOutputTokens }),
  });
}

// ─── Chat / LLM ──────────────────────────────────────

export async function listChatSessions() {
  return fetchJSON('/llm/sessions');
}

export async function createChatSession() {
  return fetchJSON('/llm/sessions', { method: 'POST' });
}

export async function sendChatMessage({ text, model = 'auto', attachment = null }) {
  const body = { text, model };
  if (attachment) {
    body.attachment = {
      name: attachment.name,
      size: attachment.size,
      type: attachment.type,
    };
  }
  return fetchJSON('/llm/chat', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// ─── Tickets / M-Support ─────────────────────────────

export async function listTickets() {
  return fetchJSON('/tickets');
}

// ─── Admin ───────────────────────────────────────────

export async function listProviders() {
  return fetchJSON('/admin/providers');
}

export async function updateProvider(name, changes) {
  return fetchJSON('/admin/providers', {
    method: 'PUT',
    body: JSON.stringify({ name, ...changes }),
  });
}

export async function listQuotaProfiles() {
  return fetchJSON('/admin/quotas');
}

export async function listRoles() {
  return fetchJSON('/admin/roles');
}

export async function getMailboxSettings() {
  return fetchJSON('/admin/mailbox');
}