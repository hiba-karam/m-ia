import React, { useState, useRef, useEffect } from "react";
import { Send, Plus, Paperclip, X, FileText, MessageSquare } from "lucide-react";
import QuotaGauge from "../../components/QuotaGauge";
import {
  sendChatMessage, getTokenUsage, listChatSessions, createChatSession, listProviders,
} from "../../services/api/client";
import { modelTagColors } from "../../services/api/mockData";
import "./Chat.css";

const TOKENS_PER_MESSAGE = 350;

function MicroGauge({ used, budget }) {
  const pct = Math.min(100, Math.round((used / budget) * 100));
  const zone = pct >= 90 ? "red" : pct >= 70 ? "amber" : "teal";
  return (
    <div className="chat__micro-gauge" title={`${used.toLocaleString("fr-FR")} / ${budget.toLocaleString("fr-FR")} tokens`}>
      <span className={`chat__micro-dot chat__micro-dot--${zone}`} />
      <span className="chat__micro-text">{used.toLocaleString("fr-FR")} tok.</span>
    </div>
  );
}

export default function Chat() {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  // Store messages per session: { [sessionId]: message[] }
  const [sessionsMessages, setSessionsMessages] = useState({});
  const [input, setInput] = useState("");
  const [pendingFile, setPendingFile] = useState(null);
  const [model, setModel] = useState("auto");
  const [providers, setProviders] = useState([]);
  const [quota, setQuota] = useState({ remainingDailyTokens: 12600, dailyBudget: 20000 });
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    getTokenUsage().then((data) =>
      setQuota({ remainingDailyTokens: data.remainingDailyTokens, dailyBudget: data.dailyBudget })
    );
    listChatSessions().then((data) => {
      setSessions(data);
      if (data.length > 0) {
        setActiveSessionId(data[0].id);
      }
    });
    listProviders().then(setProviders);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [activeSessionId, sessionsMessages]);

  const currentMessages = activeSessionId ? (sessionsMessages[activeSessionId] || []) : [];

  async function handleNewConversation() {
    const session = await createChatSession();
    setSessions((s) => [session, ...s]);
    setActiveSessionId(session.id);
    setSessionsMessages((prev) => ({
      ...prev,
      [session.id]: [],
    }));
  }

  function handleSelectSession(sessionId) {
    setActiveSessionId(sessionId);
    // Initialize session messages if not already present
    if (!sessionsMessages[sessionId]) {
      setSessionsMessages((prev) => ({
        ...prev,
        [sessionId]: [],
      }));
    }
  }

  function handleFilePick(e) {
    const file = e.target.files?.[0];
    if (file) setPendingFile(file);
    e.target.value = "";
  }

  async function send() {
    if (!input.trim() && !pendingFile) return;
    if (isSending) return;

    setIsSending(true);
    const text = input;
    const attachment = pendingFile;

    // Auto-create a session if none exists
    let sessionId = activeSessionId;
    if (!sessionId) {
      const session = await createChatSession();
      setSessions((s) => [session, ...s]);
      setActiveSessionId(session.id);
      sessionId = session.id;
      setSessionsMessages((prev) => ({
        ...prev,
        [session.id]: [],
      }));
    }

    // Add user message to the current session
    const userMsg = { role: "user", text, attachment: attachment?.name };
    setSessionsMessages((prev) => ({
      ...prev,
      [sessionId]: [...(prev[sessionId] || []), userMsg],
    }));
    setInput("");
    setPendingFile(null);

    // Simulate AI response after delay
    const reply = await sendChatMessage({ text, model, attachment });
    setSessionsMessages((prev) => ({
      ...prev,
      [sessionId]: [...(prev[sessionId] || []), { role: "assistant", ...reply }],
    }));

    // Update quota (approximate)
    setQuota((prev) => ({
      ...prev,
      remainingDailyTokens: Math.max(0, prev.remainingDailyTokens - TOKENS_PER_MESSAGE),
    }));

    // Update session title in sidebar based on first user message
    if (text && text.length > 0) {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === sessionId
            ? { ...s, title: text.length > 40 ? text.substring(0, 40) + "…" : text, updatedAt: "à l'instant" }
            : s
        )
      );
    }

    setIsSending(false);
  }

  const used = quota.dailyBudget - quota.remainingDailyTokens;
  const enabledProviders = providers.filter((p) => p.enabled);

  return (
    <div className="chat-layout">
      {/* Historique des conversations */}
      <aside className="chat-history">
        <button className="chat-history__new" onClick={handleNewConversation}>
          <Plus size={15} /> Nouvelle conversation
        </button>
        <div className="chat-history__list">
          {sessions.length === 0 ? (
            <div className="chat-history__empty">
              <MessageSquare size={20} strokeWidth={1.5} />
              <span>Aucune conversation</span>
            </div>
          ) : (
            sessions.map((s) => (
              <button
                key={s.id}
                className={"chat-history__item" + (s.id === activeSessionId ? " chat-history__item--active" : "")}
                onClick={() => handleSelectSession(s.id)}
              >
                <div className="chat-history__item-title">{s.title}</div>
                <div className="chat-history__item-date">{s.updatedAt}</div>
              </button>
            ))
          )}
        </div>
      </aside>

      <div className="chat">
        <header className="chat__header">
          <div>
            <h1>Assistant IA interne</h1>
            <p>Mode automatique — routage selon coût et confidentialité</p>
          </div>
          <div className="chat__header-right">
            <select
              className="chat__model-select"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              aria-label="Choix du modèle"
            >
              <option value="auto">Mode automatique</option>
              {enabledProviders.map((p) => (
                <option key={p.name} value={p.name}>{p.name}</option>
              ))}
            </select>
            <div className="chat__quota">
              <QuotaGauge label="Quota jour" used={used} budget={quota.dailyBudget} compact />
              <div className="chat__quota-figure">
                {used.toLocaleString("fr-FR")} / {quota.dailyBudget.toLocaleString("fr-FR")} tokens
              </div>
            </div>
          </div>
        </header>

        {!activeSessionId ? (
          <div className="chat__empty-center">
            <div className="chat__empty-icon">
              <MessageSquare size={48} strokeWidth={1.2} />
            </div>
            <h2>Bienvenue sur M-IA</h2>
            <p>
              Cliquez sur <strong>Nouvelle conversation</strong> pour commencer
              ou sélectionnez une conversation existante dans l'historique.
            </p>
          </div>
        ) : (
          <div className="chat__body" ref={scrollRef}>
            <div className="chat__thread">
              {currentMessages.map((m, i) => (
                <div key={i} className={`chat__row chat__row--${m.role}`}>
                  {m.role === "assistant" && (
                    <>
                      <span
                        className="chat__model-tag"
                        style={{ color: modelTagColors[m.model]?.color, background: modelTagColors[m.model]?.bg }}
                      >
                        {m.model} · {m.useCase}
                      </span>
                      <MicroGauge used={used} budget={quota.dailyBudget} />
                    </>
                  )}
                  <div className={`chat__bubble chat__bubble--${m.role}`}>
                    {m.attachment && (
                      <div className="chat__attachment-chip">
                        <FileText size={13} /> {m.attachment}
                      </div>
                    )}
                    {m.text}
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="chat__row chat__row--assistant">
                  <div className="chat__bubble chat__bubble--assistant chat__bubble--typing">
                    <span className="chat__typing-dot" />
                    <span className="chat__typing-dot" />
                    <span className="chat__typing-dot" />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="chat__composer">
          {pendingFile && (
            <div className="chat__pending-file">
              <FileText size={13} /> {pendingFile.name}
              <button onClick={() => setPendingFile(null)} aria-label="Retirer le fichier">
                <X size={13} />
              </button>
            </div>
          )}
          <div className="chat__input-row">
            <input type="file" ref={fileInputRef} hidden onChange={handleFilePick} />
            <button
              className="chat__attach-btn"
              onClick={() => fileInputRef.current?.click()}
              aria-label="Joindre un fichier"
              type="button"
            >
              <Paperclip size={16} />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Posez une question ou décrivez un document à analyser…"
              disabled={isSending}
            />
            <button onClick={send} aria-label="Envoyer" disabled={isSending}>
              <Send size={15} />
            </button>
          </div>
          <p className="chat__disclaimer">
            Aucune clé API n'est jamais exposée côté client — tous les appels passent par le LLM Gateway.
          </p>
        </div>
      </div>
    </div>
  );
}