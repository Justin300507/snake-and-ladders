import React from 'react';

const SnakeLadderOverlay = () => {
  // Define snakes and ladders as objects with start and end positions
  // These are illustrative and would ideally come from the backend or a game config
  const snakes = [
    { start: 98, end: 78 }, { start: 95, end: 75 }, { start: 93, end: 73 },
    { start: 87, end: 24 }, { start: 64, end: 60 }, { start: 62, end: 19 },
    { start: 49, end: 11 }, { start: 46, end: 25 }, { start: 36, end: 6 },
  ];

  const ladders = [
    { start: 1, end: 38 }, { start: 4, end: 14 }, { start: 9, end: 31 },
    { start: 21, end: 42 }, { start: 28, end: 84 }, { start: 51, end: 67 },
    { start: 71, end: 91 }, { start: 80, end: 99 },
  ];

  const getCellCoordinates = (cellNumber) => {
    const row = Math.floor((cellNumber - 1) / 10);
    const col = (cellNumber - 1) % 10;
    const x = row % 2 === 0 ? col : 9 - col; // Snake pattern for columns
    const y = 9 - row; // Rows from bottom to top

    // Calculate center coordinates for each cell (0-100%)
    const centerX = (x * 10 + 5);
    const centerY = (y * 10 + 5);
    return { x: centerX, y: centerY };
  };

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none">
      {snakes.map((s, i) => {
        const start = getCellCoordinates(s.start);
        const end = getCellCoordinates(s.end);
        return (
          <line
            key={`snake-${i}`}
            x1={`${start.x}%`} y1={`${start.y}%`}
            x2={`${end.x}%`} y2={`${end.y}%`}
            stroke="#ef4444" // Red for snakes
            strokeWidth="4"
            strokeLinecap="round"
            className="opacity-70"
          />
        );
      })}
      {ladders.map((l, i) => {
        const start = getCellCoordinates(l.start);
        const end = getCellCoordinates(l.end);
        return (
          <line
            key={`ladder-${i}`}
            x1={`${start.x}%`} y1={`${start.y}%`}
            x2={`${end.x}%`} y2={`${end.y}%`}
            stroke="#22c55e" // Green for ladders
            strokeWidth="4"
            strokeLinecap="round"
            className="opacity-70"
          />
        );
      })}
    </svg>
  );
};

export default SnakeLadderOverlay;