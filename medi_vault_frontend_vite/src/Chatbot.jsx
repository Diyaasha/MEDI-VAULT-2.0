import { useState, useRef, useEffect, useCallback } from 'react';
import './Chatbot.css';

const API_BASE = 'http://localhost:3000/api';

// Simple markdown-like formatter for bot messages
function formatBotMessage(text) {
  return text
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^[-•] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gs, (match) => `<ul>${match}</ul>`)
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/\n/g, '<br/>');
}

const QUICK_PROMPTS = [
  { icon: '💊', text: 'What medications am I taking?' },
    { icon: '💉', text: 'When is my next vaccine due?' },
  { icon: '📊', text: 'Summarize my recent health reports' },
  { icon: '😴', text: 'How has my wellness been this week?' },
  { icon: '🩺', text: 'Show my treatment plan progress' },
  { icon: '❤️', text: 'Give me general heart health tips' },
];

export default function Chatbot({ token, onLogout }) {
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'bot',
      text: "Hello! I'm **MediBot** 🏥, your personal AI health assistant.\n\nI can help you with:\n- Answering health & medical questions\n- Reviewing your medicine reminders\n- Checking your vaccination status\n- Summarizing your medical reports\n- Analyzing your wellness trends\n\nWhat can I help you with today?",
      time: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = async (queryText, isReset = false) => {
    const text = queryText || input.trim();
    if (!text || isTyping) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      time: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/patient-query/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: text,
          resetSession: isReset || !sessionStarted,
        }),
      });

      if (res.status === 401) {
        onLogout();
        return;
      }

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || `Server error ${res.status}`);
      }

      const data = await res.json();
      setSessionStarted(true);

      const botMsg = {
        id: `bot-${Date.now()}`,
        role: 'bot',
        text: data.answer,
        time: new Date(),
        dataUsed: data.patientDataUsed,
        disclaimer: data.disclaimer,
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setError(err.message);
      const errMsg = {
        id: `err-${Date.now()}`,
        role: 'bot',
        text: `⚠️ Sorry, I encountered an error: ${err.message}. Please try again.`,
        time: new Date(),
        isError: true,
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: 'welcome-new',
        role: 'bot',
        text: "New conversation started! 🌟 How can I assist you with your health today?",
        time: new Date(),
      },
    ]);
    setSessionStarted(false);
    setError(null);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) =>
    new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);

  return (
    <div className="chatbot-container">
      {/* Header */}
      <div className="chatbot-header">
        <div className="chatbot-header-left">
          <div className="bot-avatar-large">
            <span>🤖</span>
            <div className="bot-status-dot" />
          </div>
          <div className="chatbot-header-info">
            <h1 className="chatbot-title">MediBot</h1>
            <p className="chatbot-subtitle">AI Health Assistant • Powered by Gemini</p>
          </div>
        </div>
        <div className="chatbot-header-actions">
          <button
            id="new-chat-btn"
            className="header-btn"
            onClick={handleNewChat}
            title="Start new conversation"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            New Chat
          </button>
          <button
            id="logout-btn"
            className="header-btn logout"
            onClick={onLogout}
            title="Log out"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="chatbot-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-row ${msg.role}`}>
            {msg.role === 'bot' && (
              <div className="avatar bot-avatar">🤖</div>
            )}
            <div className={`message-bubble ${msg.role} ${msg.isError ? 'error' : ''}`}>
              {msg.role === 'bot' ? (
                <div
                  className="message-text"
                  dangerouslySetInnerHTML={{
                    __html: formatBotMessage(msg.text),
                  }}
                />
              ) : (
                <div className="message-text">{msg.text}</div>
              )}
              <div className="message-meta">
                <span className="message-time">{formatTime(msg.time)}</span>
                {msg.dataUsed && (
                  <span className="data-badge" title="Patient data sources used">
                    📂 {Object.values(msg.dataUsed).reduce((a, b) => a + b, 0)} records
                  </span>
                )}
              </div>
              {msg.disclaimer && (
                <div className="message-disclaimer">
                  ⚕️ {msg.disclaimer}
                </div>
              )}
            </div>
            {msg.role === 'user' && (
              <div className="avatar user-avatar">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
                </svg>
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="message-row bot">
            <div className="avatar bot-avatar">🤖</div>
            <div className="message-bubble bot typing-bubble">
              <div className="typing-indicator">
                <span /><span /><span />
              </div>
              <span className="typing-text">MediBot is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts */}
      {messages.length <= 2 && !isTyping && (
        <div className="quick-prompts">
          <p className="quick-prompts-label">Quick questions:</p>
          <div className="quick-prompts-grid">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt.text}
                className="quick-prompt-btn"
                onClick={() => sendMessage(prompt.text)}
              >
                <span className="quick-prompt-icon">{prompt.icon}</span>
                <span>{prompt.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="chatbot-input-area">
        <div className="input-wrapper">
          <textarea
            ref={inputRef}
            id="chat-input"
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about your health, medications, reports..."
            rows={1}
            disabled={isTyping}
            maxLength={1000}
          />
          <button
            id="send-btn"
            className={`send-btn ${input.trim() && !isTyping ? 'active' : ''}`}
            onClick={() => sendMessage()}
            disabled={!input.trim() || isTyping}
            title="Send message"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
        <div className="input-footer">
          <span className="char-count">{input.length}/1000</span>
          <span className="input-hint">Press Enter to send • Shift+Enter for new line</span>
        </div>
      </div>
    </div>
  );
}
