import React from 'react';
import API from '../api';
import { Plus, Loader2 } from 'lucide-react';

const parseError = (err) => {
  if (!err.response) return null;
  const detail = err.response?.data?.detail;
  if (!detail) return 'Something went wrong. Please try again.';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map(d => d.msg).join(', ');
  return 'Something went wrong. Please try again.';
};

const NewGameForm = ({ onGameCreated, showToast }) => {
  const [numPlayers, setNumPlayers] = React.useState(2);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post('/games', { num_players: numPlayers });
      showToast(`Game #${res.data.id} created successfully!`, 'success');
      onGameCreated();
    } catch (err) {
      const msg = parseError(err) || 'Failed to create game.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white/80 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border border-slate-100 dark:border-slate-700/60 ring-1 ring-black/5 dark:ring-white/5 p-5 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-4">Create New Game</h3>
      <div className="space-y-3">
        <div className="space-y-1">
          <label htmlFor="numPlayers" className="text-xs font-medium text-slate-700 dark:text-slate-300">Number of Players</label>
          <input
            id="numPlayers"
            type="number"
            min="2"
            max="4"
            value={numPlayers}
            onChange={e => setNumPlayers(Number(e.target.value))}
            className="input"
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-white font-medium bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 active:scale-[0.97] shadow-lg shadow-indigo-500/25 transition-all duration-150"
          disabled={loading}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} Create Game
        </button>
      </div>
    </form>
  );
};

export default NewGameForm;