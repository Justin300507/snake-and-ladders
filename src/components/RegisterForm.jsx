import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import { Loader2 } from 'lucide-react';

const parseError = (err) => {
  if (!err.response) return null;
  const detail = err.response?.data?.detail;
  if (!detail) return 'Something went wrong. Please try again.';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map(d => d.msg).join(', ');
  return 'Something went wrong. Please try again.';
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const RegisterForm = () => {
  const [email, setEmail] = React.useState('');
  const [displayName, setDisplayName] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [status, setStatus] = React.useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setStatus('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      setLoading(false);
      return;
    }

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        setStatus(attempt === 1 ? 'Registering...' : `Starting up... retrying (${attempt}/3)`);
        // Step 1: create account
        await API.post('/auth/register', { email, password, display_name: displayName });

        // Step 2: immediately log in
        setStatus('Account created. Signing in...');
        const loginRes = await API.post('/auth/login', { email, password });
        localStorage.setItem('token', loginRes.data.access_token);
        if (loginRes.data.display_name) localStorage.setItem('display_name', loginRes.data.display_name);
        if (loginRes.data.user_id) localStorage.setItem('user_id', String(loginRes.data.user_id));
        if (loginRes.data.email) localStorage.setItem('user_email', loginRes.data.email);
        navigate('/home');
        return;
      } catch (err) {
        const msg = parseError(err);
        if (msg) { setError(msg); setStatus(null); setLoading(false); return; }
        if (attempt < 3) { setStatus(`Backend starting up... retrying in 15s (${attempt}/3)`); await sleep(15000); }
      }
    }
    setError('Backend took too long. Wait 30 seconds then try again.');
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="bg-red-500 text-white text-sm p-3 rounded-lg">{error}</div>}
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Email</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="input"
          required
          disabled={loading}
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Display Name</label>
        <input
          type="text"
          value={displayName}
          onChange={e => setDisplayName(e.target.value)}
          placeholder="Your Name (optional)"
          className="input"
          disabled={loading}
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-700 dark:text-slate-300">Password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="••••••••"
          className="input"
          required
          disabled={loading}
        />
        <p className="text-xs text-slate-400">Must be at least 8 characters</p>
      </div>
      {status && <p className="text-sm text-slate-500 dark:text-slate-400 text-center">{status}</p>}
      <button
        type="submit"
        className="w-full justify-center inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white font-medium bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 active:scale-[0.97] shadow-lg shadow-indigo-500/25 transition-all duration-150"
        disabled={loading || !email || !password || password.length < 8}
      >
        {loading && <Loader2 size={16} className="animate-spin" />} Register
      </button>
    </form>
  );
};

export default RegisterForm;
