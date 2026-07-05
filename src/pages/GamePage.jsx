import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Play, Pause, RotateCcw, CheckCircle, XCircle, Clock, Award } from 'lucide-react';
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

const GamePage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
  const [status, setStatus] = React.useState('');
  const [playerGuess, setPlayerGuess] = React.useState('');
  const [isGuessing, setIsGuessing] = React.useState(false);
  const [guessError, setGuessError] = React.useState(null);
  const [timer, setTimer] = React.useState(0);
  const timerRef = React.useRef(null);

  const fetchGame = async () => {
    setLoading(true);
    setError(null);
    setStatus('');

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        setStatus(attempt === 1 ? 'Loading game...' : `Waking up the server... retrying (${attempt}/3)`);
        const res = await API.get(`/games/${gameId}`);
        setGame(res.data);
        return;
      } catch (err) {
        const msg = parseError(err);
        if (msg) { setError(msg); return; }
        if (attempt < 3) { await sleep(15000); }
      }
    }
    setError('Failed to load game. Backend took too long to respond.');
  };

  React.useEffect(() => {
    fetchGame().finally(() => setLoading(false));
  }, [gameId]);

  React.useEffect(() => {
    if (game && game.status === 'in_progress') {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [game]);

  const handleStartGame = async () => {
    try {
      const res = await API.post(`/games/${gameId}/start`);
      setGame(res.data);
      setTimer(0);
    } catch (err) {
      setError(parseError(err));
    }
  };

  const handleMakeGuess = async (e) => {
    e.preventDefault();
    setIsGuessing(true);
    setGuessError(null);
    try {
      const res = await API.post(`/games/${gameId}/guess`, { guess: playerGuess });
      setGame(res.data);
      setPlayerGuess('');
    } catch (err) {
      setGuessError(parseError(err));
    } finally {
      setIsGuessing(false);
    }
  };

  const handleResetGame = async () => {
    try {
      const res = await API.post(`/games/${gameId}/reset`);
      setGame(res.data);
      setPlayerGuess('');
      setTimer(0);
    } catch (err) {
      setError(parseError(err));
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Game Details</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">View and play your game.</p>
        </div>
        <button
          onClick={() => navigate('/games')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          Back to Games
        </button>
      </div>

      {status && <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{status}</p>}
      {loading ? (
        <div className="animate-pulse space-y-6">
          <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        </div>
      ) : error ? (
        <div className="bg-red-500 text-white text-sm p-3 rounded-lg">{error}</div>
      ) : game ? (
        <div className="bg-white/80 dark:bg-slate-800/70 backdrop-blur-xl rounded-xl p-6 border border-slate-100 dark:border-slate-700/60 ring-1 ring-black/5 dark:ring-white/5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">Game: {game.name}</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-2">Description: {game.description}</p>
          <p className="text-slate-600 dark:text-slate-300 mb-4">Status: <span className={`font-medium ${game.status === 'completed' ? 'text-green-600' : game.status === 'in_progress' ? 'text-blue-600' : 'text-slate-500'}`}>{game.status.replace('_', ' ')}</span></p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
              <Clock size={20} className="text-slate-500 dark:text-slate-400 mr-2" />
              <span className="text-slate-700 dark:text-slate-200">Time Elapsed: {formatTime(timer)}</span>
            </div>
            <div className="flex items-center bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg">
              <Award size={20} className="text-slate-500 dark:text-slate-400 mr-2" />
              <span className="text-slate-700 dark:text-slate-200">Attempts: {game.attempts}</span>
            </div>
          </div>

          {game.status === 'pending' && (
            <button
              onClick={handleStartGame}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600"
            >
              <Play size={18} className="mr-2" /> Start Game
            </button>
          )}

          {game.status === 'in_progress' && (
            <form onSubmit={handleMakeGuess} className="mt-4">
              <label htmlFor="playerGuess" className="block text-sm font-medium text-slate-700 dark:text-slate-200">Your Guess:</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  name="playerGuess"
                  id="playerGuess"
                  value={playerGuess}
                  onChange={(e) => setPlayerGuess(e.target.value)}
                  className="flex-1 block w-full rounded-none rounded-l-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Enter your guess"
                  required
                />
                <button
                  type="submit"
                  disabled={isGuessing}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGuessing ? <Loader2 size={18} className="animate-spin mr-2" /> : <CheckCircle size={18} className="mr-2" />} Guess
                </button>
              </div>
              {guessError && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{guessError}</p>}
            </form>
          )}

          {game.status === 'completed' && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg flex items-center">
              <CheckCircle size={24} className="text-green-600 dark:text-green-400 mr-3" />
              <p className="text-green-800 dark:text-green-200 font-medium">Congratulations! You completed the game in {game.attempts} attempts and {formatTime(timer)}.</p>
            </div>
          )}

          {game.status === 'failed' && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/30 rounded-lg flex items-center">
              <XCircle size={24} className="text-red-600 dark:text-red-400 mr-3" />
              <p className="text-red-800 dark:text-red-200 font-medium">Game Over! You ran out of attempts.</p>
            </div>
          )}

          {(game.status === 'completed' || game.status === 'failed') && (
            <button
              onClick={handleResetGame}
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              <RotateCcw size={18} className="mr-2" /> Play Again
            </button>
          )}

          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mt-8 mb-3">Guess History</h3>
          {game.guesses && game.guesses.length > 0 ? (
            <ul className="space-y-2">
              {game.guesses.map((guess, index) => (
                <li key={index} className="flex items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                  <span className="font-mono text-slate-700 dark:text-slate-200 mr-3">{index + 1}.</span>
                  <span className="text-slate-800 dark:text-slate-100 flex-grow">{guess.guess}</span>
                  {guess.is_correct ? (
                    <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
                  ) : (
                    <XCircle size={18} className="text-red-600 dark:text-red-400" />
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500 dark:text-slate-400">No guesses made yet.</p>
          )}
        </div>
      ) : (
        <p className="text-slate-500 dark:text-slate-400">No game data available.</p>
      )}
    </div>
  );
};

export default GamePage;
