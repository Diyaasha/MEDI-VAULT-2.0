import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./AIHealthAssistantPage.css";

const API_BASE =
  (process.env.REACT_APP_API_URL || "http://localhost:3000") + "/api";

// Simple markdown-like formatter for bot responses
function formatBotMessage(text) {
  return text
    .replace(/^## (.+)$/gm, "<h3>$1</h3>")
    .replace(/^### (.+)$/gm, "<h4>$1</h4>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/^[-•] (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>[\s\S]*?<\/li>)/g, (m) => `<ul>${m}</ul>`)
    .replace(/\n{2,}/g, "</p><p>")
    .replace(/\n/g, "<br/>");
}

const QUICK_PROMPTS = [
  { icon: "💊", text: "What medications am I taking?" },
  { icon: "💉", text: "When is my next vaccine due?" },
  { icon: "📊", text: "Summarize my recent health reports" },
  { icon: "😴", text: "How has my wellness been this week?" },
  { icon: "🩺", text: "Show my treatment plan progress" },
  { icon: "❤️", text: "Give me general heart health tips" },
];

export default function AIHealthAssistantPage() {
  const navigate = useNavigate();

  // Helper — always read fresh from storage so stale closures never send a bad token
  const getToken = () => {
    try {
      const stored = localStorage.getItem("user");
      return stored ? JSON.parse(stored).token : null;
    } catch {
      return null;
    }
  };

  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "bot",
      text: "Hello! I'm **MediBot** 🏥, your personal AI health assistant.\n\nI can help you with:\n- Answering any health & medical questions\n- Reviewing your medicine reminders & vaccinations\n- Summarizing your uploaded medical reports\n- Analyzing your wellness trends\n\nWhat can I help you with today?",
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (!getToken()) {
      navigate("/login");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = async (queryText) => {
    const text = (queryText || input).trim();
    if (!text || isTyping) return;

    // Read token fresh on every call — prevents stale-closure auth failures
    const token = getToken();
    if (!token) {
      navigate("/login");
      return;
    }

    const userMsg = {
      id: `user-${Date.now()}`,
      role: "user",
      text,
      time: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch(`${API_BASE}/patient-query/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: text,
          resetSession: !sessionStarted,
        }),
      });

      // 401 = session expired or invalid token → re-login
      if (res.status === 401) {
        localStorage.removeItem("user");
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: "bot",
            text: "🔒 Your session has expired. Please log in again to continue.",
            time: new Date(),
            isError: true,
            isAuthError: true,
          },
        ]);
        setIsTyping(false);
        setTimeout(() => navigate("/login"), 2000);
        return;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `Server error ${res.status}`);
      }

      const data = await res.json();
      setSessionStarted(true);

      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: "bot",
          text: data.answer,
          time: new Date(),
          dataUsed: data.patientDataUsed,
          disclaimer: data.disclaimer,
        },
      ]);
    } catch (err) {
      // Network error (backend unreachable, CORS, etc.)
      const isNetworkError =
        err.message === "Failed to fetch" ||
        err.message.includes("NetworkError") ||
        err.message.includes("fetch");

      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "bot",
          text: isNetworkError
            ? "🌐 Unable to reach the server. Please make sure the backend is running and try again."
            : `⚠️ ${err.message}. Please try again.`,
          time: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setIsTyping(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "bot",
        text: "New conversation started! 🌟 How can I assist you with your health today?",
        time: new Date(),
      },
    ]);
    setSessionStarted(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const fmtTime = (d) =>
    new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);

  return (
    <div className="aha-container">
      {/* Header */}
      <div className="aha-header">
        <div className="aha-header-left">
          <button
            className="aha-back-btn"
            onClick={() => navigate("/")}
            title="Back to Home"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>
          <div className="aha-bot-avatar">
            <span>💬</span>
            <div className="aha-status-dot" />
          </div>
          <div>
            <h1 className="aha-title">AI Health Assistant</h1>
            <p className="aha-subtitle">Powered by Gemini AI · Your data stays private</p>
          </div>
        </div>
        <button className="aha-new-chat-btn" onClick={handleNewChat}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Chat
        </button>
      </div>

      {/* Messages */}
      <div className="aha-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`aha-msg-row ${msg.role}`}>
            {msg.role === "bot" && (
              <div className="aha-avatar bot">💬</div>
            )}
            <div
              className={`aha-bubble ${msg.role}${msg.isError ? " error" : ""}`}
            >
              {msg.role === "bot" ? (
                <div
                  className="aha-text"
                  dangerouslySetInnerHTML={{
                    __html: formatBotMessage(msg.text),
                  }}
                />
              ) : (
                <div className="aha-text">{msg.text}</div>
              )}
              <div className="aha-meta">
                <span className="aha-time">{fmtTime(msg.time)}</span>
                {msg.dataUsed && (
                  <span className="aha-data-badge">
                    📂{" "}
                    {Object.values(msg.dataUsed).reduce((a, b) => a + b, 0)}{" "}
                    records used
                  </span>
                )}
              </div>
              {msg.disclaimer && (
                <div className="aha-disclaimer">⚕️ {msg.disclaimer}</div>
              )}
            </div>
            {msg.role === "user" && (
              <div className="aha-avatar user">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="aha-msg-row bot">
            <div className="aha-avatar bot">💬</div>
            <div className="aha-bubble bot aha-typing-bubble">
              <div className="aha-typing">
                <span /><span /><span />
              </div>
              <span className="aha-typing-text">MediBot is thinking…</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts — shown only at start */}
      {messages.length <= 2 && !isTyping && (
        <div className="aha-quick-prompts">
          <p className="aha-quick-label">Quick questions to get started:</p>
          <div className="aha-quick-grid">
            {QUICK_PROMPTS.map((p) => (
              <button
                key={p.text}
                className="aha-quick-btn"
                onClick={() => sendMessage(p.text)}
              >
                <span className="aha-quick-icon">{p.icon}</span>
                <span>{p.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="aha-input-area">
        <div className="aha-input-wrapper">
          <textarea
            ref={inputRef}
            id="aha-chat-input"
            className="aha-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your health, medications, reports…"
            rows={1}
            disabled={isTyping}
            maxLength={1000}
          />
          <button
            id="aha-send-btn"
            className={`aha-send-btn${input.trim() && !isTyping ? " active" : ""}`}
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <div className="aha-input-footer">
          <span className="aha-char">{input.length}/1000</span>
          <span className="aha-hint">Enter to send · Shift+Enter for new line</span>
        </div>
      </div>
    </div>
  );
}
