import React from 'react';
import { Clock } from 'lucide-react';

const PlayerTurnIndicator = ({ currentTurnPlayerId, players }) => {
  const currentPlayer = players.find(p => p.user_id === currentTurnPlayerId);
  const currentPlayerName = currentPlayer ? `Player ${currentPlayer.user_id}` : 'Unknown Player';

  return (
    <div className="bg-white/80 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border border-slate-100 dark:border-slate-700/60 ring-1 ring-black/5 dark:ring-white/5 p-4 flex items-center gap-3 shadow-sm">
      <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/40 dark:to-indigo-900/20 flex items-center justify-center">
        <Clock size={18} className="text-indigo-600 dark:text-indigo-400" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Current Turn</p>
        <p className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">{currentPlayerName}</p>
      </div>
    </div>
  );
};

export default PlayerTurnIndicator;