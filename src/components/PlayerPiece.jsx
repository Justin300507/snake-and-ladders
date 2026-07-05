import React from 'react';

const PlayerPiece = ({ player, getCellPosition, isCurrentPlayerTurn }) => {
  const { x, y } = getCellPosition(player.current_position);

  const playerColors = [
    'bg-red-500',
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
  ];
  const playerColor = playerColors[player.turn_order % playerColors.length];

  return (
    <div
      className={`absolute w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold transition-all duration-500 ease-in-out transform -translate-x-1/2 -translate-y-1/2`
        ${playerColor} ${isCurrentPlayerTurn ? 'ring-4 ring-indigo-500 scale-110' : ''}`}`
      style={{
        left: `${(x / 10) * 100 + 5}%`,
        top: `${(y / 10) * 100 + 5}%`,
      }}
    >
      {player.user_id}
    </div>
  );
};

export default PlayerPiece;