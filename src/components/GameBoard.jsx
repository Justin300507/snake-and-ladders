import React from 'react';
import PlayerPiece from './PlayerPiece';
import SnakeLadderOverlay from './SnakeLadderOverlay';

const GameBoard = ({ playerStates, gameId, currentTurnPlayerId, showToast }) => {
  const boardSize = 100; // 10x10 board
  const cells = Array.from({ length: boardSize }, (_, i) => i + 1);

  const getCellPosition = (cellNumber) => {
    const row = Math.floor((cellNumber - 1) / 10);
    const col = (cellNumber - 1) % 10;
    const x = row % 2 === 0 ? col : 9 - col; // Snake pattern for columns
    const y = 9 - row; // Rows from bottom to top
    return { x, y };
  };

  return (
    <div className="relative w-full aspect-square bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-600 shadow-lg">
      <div className="grid grid-cols-10 gap-0.5 h-full">
        {cells.map((cellNumber) => {
          const { x, y } = getCellPosition(cellNumber);
          const isEvenRow = Math.floor((cellNumber - 1) / 10) % 2 === 0;
          const cellBgClass = (isEvenRow && cellNumber % 2 !== 0) || (!isEvenRow && cellNumber % 2 === 0)
            ? 'bg-slate-200 dark:bg-slate-600'
            : 'bg-white dark:bg-slate-800';

          return (
            <div
              key={cellNumber}
              className={`relative flex items-center justify-center text-xs font-semibold ${cellBgClass}`}
              style={{ gridColumn: x + 1, gridRow: y + 1 }}
            >
              {cellNumber}
            </div>
          );
        })}
      </div>
      <SnakeLadderOverlay />
      {playerStates.map(player => (
        <PlayerPiece
          key={player.user_id}
          player={player}
          getCellPosition={getCellPosition}
          isCurrentPlayerTurn={player.user_id === currentTurnPlayerId}
        />
      ))}
    </div>
  );
};

export default GameBoard;