import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Zap, Star, LogOut, Sun, Moon } from 'lucide-react';

const Header = ({ dark, setDark }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    ['token', 'display_name', 'user_id', 'user_email'].forEach(k => localStorage.removeItem(k));
    navigate('/login');
  };

  const navClass = ({ isActive }) =>
    isActive
      ? 'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/30'
      : 'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-slate-400 hover:bg-white/5 hover:text-white';

  return (
    <aside className="w-56 bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-slate-200 flex flex-col px-3 py-4 fixed h-full z-10">
      <div className="flex items-center gap-2 px-2 mb-6">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <span className="text-white text-sm font-bold">S</span>
        </div>
        <span className="font-bold text-lg bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Snakes & Ladders</span>
      </div>
      <nav className="flex-1 space-y-0.5">
        <NavLink to="/home" className={navClass}>
          <LayoutDashboard size={16} /> Dashboard
        </NavLink>
        <NavLink to="/games" className={navClass}>
          <Zap size={16} /> Game Lobby
        </NavLink>
        <NavLink to="/profile" className={navClass}>
          <Users size={16} /> Profile
        </NavLink>
      </nav>
      <div className="mt-auto border-t border-slate-800 pt-4 space-y-0.5">
        <button
          onClick={() => setDark(d => !d)}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-slate-400 hover:bg-white/5 hover:text-white w-full"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />} {dark ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-slate-400 hover:bg-white/5 hover:text-white w-full"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default Header;