import React from 'react';
import { Link } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';

const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 opacity-20 dark:opacity-10 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 opacity-10 dark:opacity-[0.07] blur-3xl" />
      </div>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 mx-auto mb-3 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <span className="text-white font-bold text-xl">S</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create an account</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Join the Snakes & Ladders fun!</p>
        </div>
        <div className="bg-white/80 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-sm ring-1 ring-black/5 dark:ring-white/5 border border-slate-100 dark:border-slate-700/60 p-6 space-y-4">
          <RegisterForm />
        </div>
        <p className="text-center text-sm text-slate-500 mt-4">
          Already have an account? <Link to="/login" className="font-medium hover:underline bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;