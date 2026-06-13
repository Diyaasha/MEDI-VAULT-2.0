import { useState } from 'react';
import './Login.css';

const API_BASE = 'https://medi-vault-zsg1.onrender.com/api';

export default function Login({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const body =
        mode === 'login'
          ? { email: form.email, password: form.password }
          : { name: form.name, email: form.email, password: form.password };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Authentication failed');

      // Store token and notify parent
      const token = data.token;
      localStorage.setItem('medibot_token', token);
      onLogin(token);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-bg">
        <div className="login-orb orb1" />
        <div className="login-orb orb2" />
        <div className="login-orb orb3" />
      </div>

      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">🏥</div>
          <div>
            <h1 className="login-brand">MEDI-VAULT</h1>
            <p className="login-brand-sub">AI Health Assistant</p>
          </div>
        </div>

        <div className="login-tabs">
          <button
            id="tab-login"
            className={`login-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(''); }}
          >
            Sign In
          </button>
          <button
            id="tab-register"
            className={`login-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError(''); }}
          >
            Create Account
          </button>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="John Doe"
                required
                autoComplete="name"
              />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={6}
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button
            id="auth-submit-btn"
            type="submit"
            className="login-btn"
            disabled={loading}
          >
            {loading
              ? mode === 'login' ? 'Signing in...' : 'Creating account...'
              : mode === 'login' ? 'Sign In to MediBot' : 'Create Account'}
          </button>
        </form>

        <p className="login-footer">
          Your health data is encrypted and secure 🔒
        </p>
      </div>
    </div>
  );
}
