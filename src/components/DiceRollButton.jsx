import React from 'react';
import { Zap, Loader2 } from 'lucide-react';
import API from '../api';

const parseError = (err) => {
  if (!err.response) return null;
  const detail = err.response?.data?.detail;
  if (!detail) return 'Something went wrong. Please try again.';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map(d => d.msg).join(', ');
  return 'Something went wrong. Please try again.';
};

const DiceRollButton = ({ gameId, onRollSuccess, isPlayerTurn, showToast }) => {
  const [loading, setLoading] = React.useState(false);

  const handleRollDice = async () => {
    setLoading(true);
    try {
      const res = await API.post(`/games/${gameId}/roll_dice`);
      showToast(`You rolled a ${res.data.dice_roll}! Moved to position ${res.data.new_position}.`, 'success');
      onRollSuccess();
    } catch (err) {
      const msg = parseError(err) || 'Failed to roll dice.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRollDice}
      className="inline-flex items-center gap-1.5 px-6 py-3 rounded-lg text-white font-medium bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 active:scale-[0.97] shadow-lg shadow-indigo-500/25 transition-all duration-150 text-lg"
      disabled={loading || !isPlayerTurn}
    >
      {loading ? <Loader2 size={20} className="animate-spin" /> : <Zap size={20} />} Roll Dice
    </button>
  );
};

export default DiceRollButton;