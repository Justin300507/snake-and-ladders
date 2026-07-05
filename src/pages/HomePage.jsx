import React from 'react';
import { CheckSquare, Users, Zap, Star, Loader2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import API from '../api';

const parseError = (err) => {
  if (!err.response) return null;
  const detail = err.response?.data?.detail;
  if (!detail) return 'Something went wrong. Please try again.';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map(d => d.msg).join(', ');
  return 'Something went wrong. Please try again.';
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const HomePage = () => {
  const [stats, setStats] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [status, setStatus] = React.useState('');

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    setStatus('');

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        setStatus(attempt === 1 ? 'Loading dashboard...' : `Waking up the server... retrying (${attempt}/3)`);
        const res = await API.get('/stats/summary');
        setStats(res.data);
        return;
      } catch (err) {
        const msg = parseError(err);
        if (msg) { setError(msg); return; }
        if (attempt < 3) { await sleep(15000); }
      }
    }
    setError('Failed to load dashboard. Backend took too long to respond.');
  };

  React.useEffect(() => {
    fetchStats().finally(() => setLoading(false));
  }, []);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const displayName = localStorage.getItem('display_name') || 'Player';

  const chartData = [
    { month: 'Jan', games: 12 },
    { month: 'Feb', games: 15 },
    { month: 'Mar', games: 20 },
    { month: 'Apr', games: 18 },
    { month: 'May', games: 25 },
    { month: 'Jun', games: 22 },
    { month: 'Jul', games: 30 },
    { month: 'Aug', games: 28 },
    { month: 'Sep', games: 35 },
    { month: 'Oct', games: 32 },
    { month: 'Nov', games: 40 },
    { month: 'Dec', games: 38 },
  ];

  return (
    <div className="animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Welcome, {displayName}!</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{today}</p>
        </div>
      </div>

      {status && <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{status}</p>}
      {loading ? (
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            ))}
          </div>
          <div className="h-80 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        </div>
      ) : error ? (
        <div className="bg-red-500 text-white text-sm p-3 rounded-lg">{error}</div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl p-5 border border-slate-100 dark:border-slate-700/60 ring-1 ring-black/5 dark:ring-white/5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Games</p>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-900/20 p-2 rounded-lg">
                  <Zap size={18} className="text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{stats?.total_games || 0}</p>
              <p className="text-xs text-indigo-600 mt-1">All time</p>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl p-5 border border-slate-100 dark:border-slate-700/60 ring-1 ring-black/5 dark:ring-white/5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Active Games</p>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-900/20 p-2 rounded-lg">
                  <Star size={18} className="text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{stats?.active_games || 0}</p>
              <p className="text-xs text-indigo-600 mt-1">Currently playing</p>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl p-5 border border-slate-100 dark:border-slate-700/60 ring-1 ring-black/5 dark:ring-white/5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Registered Users</p>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-900/20 p-2 rounded-lg">
                  <Users size={18} className="text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{stats?.registered_users || 0}</p>
              <p className="text-xs text-indigo-600 mt-1">Total accounts</p>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl p-5 border border-slate-100 dark:border-slate-700/60 ring-1 ring-black/5 dark:ring-white/5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Completed Games</p>
                <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-900/20 p-2 rounded-lg">
                  <CheckSquare size={18} className="text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
              <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{stats?.completed_games || 0}</p>
              <p className="text-xs text-indigo-600 mt-1">Games finished</p>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border border-slate-100 dark:border-slate-700/60 ring-1 ring-black/5 dark:ring-white/5 p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Monthly Games Overview</h3>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorGames" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#f1f5f9' }} />
                <Area type="monotone" dataKey="games" stroke="#6366f1" strokeWidth={2} fill="url(#colorGames)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default HomePage;