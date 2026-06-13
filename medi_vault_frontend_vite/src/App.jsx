import { useState, useEffect } from 'react';
import Login from './Login';
import Chatbot from './Chatbot';
import './App.css';

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem('medibot_token') || null);

  const handleLogin = (newToken) => {
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('medibot_token');
    setToken(null);
  };

  // If we have a token, show chatbot; otherwise show login
  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell">
      <Chatbot token={token} onLogout={handleLogout} />
    </div>
  );
}
