import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { LogOut, User, Activity, AlertCircle } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [apiOnline, setApiOnline] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function checkHealth() {
      try {
        const res = await api.getHealth();
        if (mounted) setApiOnline(res?.data?.status === 'healthy');
      } catch {
        if (mounted) setApiOnline(false);
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand Identity */}
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="flex items-center gap-2.5 group">
            {/* Custom geometric industrial optic logo */}
            <div className="w-8 h-8 rounded bg-slate-950 border border-slate-700 flex items-center justify-center p-1.5 shadow-xs">
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-orange-500" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="9" strokeDasharray="14 3" />
                <circle cx="12" cy="12" r="3" fill="#ea580c" />
                <line x1="12" y1="2" x2="12" y2="5" stroke="#94a3b8" strokeLinecap="round" />
                <line x1="12" y1="19" x2="12" y2="22" stroke="#94a3b8" strokeLinecap="round" />
                <line x1="2" y1="12" x2="5" y2="12" stroke="#94a3b8" strokeLinecap="round" />
                <line x1="19" y1="12" x2="22" y2="12" stroke="#94a3b8" strokeLinecap="round" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-white text-base">VISIONGUARD</span>
                <span className="px-1.5 py-0.2 rounded bg-orange-600 text-white font-mono text-[10px] uppercase font-bold tracking-wider">AI</span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal leading-none hidden sm:block">
                Autonomous Industrial Safety &amp; Incident Intelligence
              </p>
            </div>
          </Link>
        </div>

        {/* Center / Right: System telemetry & User authentication */}
        <div className="flex items-center gap-4">
          {/* Health indicator */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-xs">
            <span className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`} />
            <span className="text-slate-300 font-mono text-[11px]">
              {apiOnline ? 'ENGINE ONLINE' : 'ENGINE DISCONNECTED'}
            </span>
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-slate-200">{user.name}</div>
                <div className="text-[10px] text-slate-400 capitalize font-mono">
                  {user.role ? user.role.replace('_', ' ') : 'Safety Officer'}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 transition-colors"
                title="Sign out of VisionGuard session"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-3 py-1.5 text-xs font-medium text-white bg-orange-600 hover:bg-orange-700 rounded transition-colors shadow-xs"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
