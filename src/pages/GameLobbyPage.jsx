import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

function GameLobbyPage() {
  const [lobbyId, setLobbyId] = useState('');
  const [newGameName, setNewGameName] = useState('');
  const navigate = useNavigate();

  const handleJoinLobby = async () => {
    if (!lobbyId) return;
    try {
      // Backend defines this as PATCH /games/{id}/join, not POST.
      await API.patch(`/games/${lobbyId}/join`);
      navigate(`/game/${lobbyId}`);
    } catch (error) {
      console.error('Failed to join lobby:', error);
      alert('Failed to join lobby. Please check the ID.');
    }
  };

  const handleCreateGame = async () => {
    if (!newGameName) return;
    try {
      // Backend's GameCreate schema requires player_ids (List[int]), not a
      // free-text name -- there is no game-name field on the model at all.
      // The creating user is the first (and so far only) participant.
      const userId = Number(localStorage.getItem('user_id'));
      const response = await API.post('/games', { player_ids: [userId] });
      const newGameId = response.data.id;
      navigate(`/game/${newGameId}`);
    } catch (error) {
      console.error('Failed to create game:', error);
      alert('Failed to create game. Please try again.');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Game Lobby</h1>

      <div className="mb-8 p-6 bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Join Existing Lobby</h2>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={lobbyId}
            onChange={(e) => setLobbyId(e.target.value)}
            placeholder="Enter Lobby ID"
            className="flex-grow p-3 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Lobby ID"
          />
          <button
            onClick={handleJoinLobby}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-200"
          >
            Join Lobby
          </button>
        </div>
      </div>

      <div className="p-6 bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Create New Game</h2>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            value={newGameName}
            onChange={(e) => setNewGameName(e.target.value)}
            placeholder="Enter New Game Name"
            className="flex-grow p-3 border border-gray-600 rounded-md bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="New Game Name"
          />
          <button
            onClick={handleCreateGame}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md transition duration-200"
          >
            Create Game
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameLobbyPage;
