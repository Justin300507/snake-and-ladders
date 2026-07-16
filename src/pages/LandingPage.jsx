import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Users, Star } from 'lucide-react';

const LandingPage = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col relative overflow-hidden">
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 opacity-20 dark:opacity-10 blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 opacity-10 dark:opacity-[0.07] blur-3xl" />
    </div>

    {/* Top Bar */}
    <header className="flex justify-between items-center p-4 bg-white/80 dark:bg-slate-800/70 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <span className="text-white font-bold text-sm">S</span>
        </div>
        <span className="font-semibold text-lg bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Snakes &amp; Ladders</span>
      </div>
      <Link to="/login" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:underline">
        Sign In
      </Link>
    </header>

    {/* Hero */}
    <section className="flex-1 flex flex-col items-center justify-center text-center px-4 animate-[fadeIn_0.5s_ease-out]">
      <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
        Play Snakes &amp; Ladders Online with Friends
      </h1>
      <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 max-w-xl">
        Join games, roll dice, climb ladders and avoid snakes in real‑time multiplayer sessions.
      </p>
      <Link
        to="/register"
        className="inline-flex items-center gap-1.5 px-6 py-3 rounded-lg text-white font-medium bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 active:scale-[0.97] shadow-lg shadow-indigo-500/25 transition-all duration-150 text-lg"
      >
        Get Started
      </Link>
    </section>

    {/* Features */}
    <section className="py-12 bg-white/80 dark:bg-slate-800/70 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto grid gap-6 grid-cols-1 md:grid-cols-3 px-4">
        <div className="p-6 rounded-xl border border-slate-100 dark:border-slate-700/60 ring-1 ring-black/5 dark:ring-white/5 bg-white/80 dark:bg-slate-800/70 animate-[fadeIn_0.3s_ease-out]">
          <div className="flex items-center gap-3 mb-4">
            <Zap size={24} className="text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Game Lobby</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Create or join a game room instantly and start playing with up to four friends.
          </p>
        </div>
        <div className="p-6 rounded-xl border border-slate-100 dark:border-slate-700/60 ring-1 ring-black/5 dark:ring-white/5 bg-white/80 dark:bg-slate-800/70 animate-[fadeIn_0.3s_ease-out]">
          <div className="flex items-center gap-3 mb-4">
            <Users size={24} className="text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Real‑time Play</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Roll dice, move pieces, and see other players' actions instantly.
          </p>
        </div>
        <div className="p-6 rounded-xl border border-slate-100 dark:border-slate-700/60 ring-1 ring-black/5 dark:ring-white/5 bg-white/80 dark:bg-slate-800/70 animate-[fadeIn_0.3s_ease-out]">
          <div className="flex items-center gap-3 mb-4">
            <Star size={24} className="text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Profile &amp; Stats</h3>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Track your wins, view your profile and see leaderboard rankings.
          </p>
        </div>
      </div>
    </section>

    <footer className="mt-8 text-center text-slate-500 dark:text-slate-400 text-sm py-4">
      <p>&copy; {new Date().getFullYear()} Snakes &amp; Ladders. All rights reserved.</p>
    </footer>
  </div>
);

export default LandingPage;
