import React from 'react';
import { Star, AlertCircle } from 'lucide-react';

const GameStatusMessage = ({ gameStatus, winnerId }) => {
  let message = '';
  let icon = null;
  let colorClass = '';

  if (gameStatus === 'completed') {
    message = winnerId ? `Game Over! Player ${winnerId} wins!` : 'Game Over!';
    icon = <Star size={24} className="text-emerald-500" />;
    colorClass = 'text-emerald-700 dark:text-emerald-400';
  } else if (gameStatus === 'pending') {
    message = 'Waiting for players to join...';
    icon = <AlertCircle size={24} className="text-amber-500" />;
    colorClass = 'text-amber-700 dark:text-amber-400';
  } else if (gameStatus === 'active') {
    message = 'Game in progress!';
    icon = <Star size={24} className="text-indigo-500" />;
    colorClass = 'text-indigo-700 dark:text-indigo-400';
  }

  if (!message) return null;

  return (
    <div className="bg-white/80 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl border border-slate-100 dark:border-slate-700/60 ring-1 ring-black/5 dark:ring-white/5 p-4 flex items-center gap-4 shadow-sm">
      {icon}
      <p className={`text-lg font-semibold ${colorClass}`}>{message}</p>
    </div>
  );
};

export default GameStatusMessage;