import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Users, Clock } from 'lucide-react';

const GameCard = ({ game, players }) => {
  const navigate = useNavigate();

  const handleJoinGame = () => {
    navigate(`/games/${game.id}`);
  };

  const statusClass = game.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700';

  return (
    <div
      onClick={handleJoinGame}
      className="animate-[fadeIn_0.3s_ease-out] bg-white/80 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border border-slate-100 dark:border-slate-700/60 ring-1 ring-black/5 dark:ring-white/5 p-4 flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-900/20 flex items-center justify-center">
            <Zap size={18} className="text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Game #{game.id}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Created: {new Date(game.created_at).toLocaleDateString()}</p>
          </div>
        </div>
        <span className={`badge ${statusClass}`}>{game.status}</span>
      </div>
      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 mb-2">
        <Users size={16} />
        <span>Players: {players.length}</span>
      </div>
      {game.current_turn_player_id && (
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <Clock size={16} />
          <span>Current Turn: Player {game.current_turn_player_id}</span>
        </div>
      )}
    </div>
  );
};

export default GameCard;