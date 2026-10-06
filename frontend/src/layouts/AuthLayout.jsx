import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <DisclaimerBanner />

      <header className="px-6 py-4 border-b border-slate-800">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-slate-950 border border-slate-700 flex items-center justify-center p-1">
              <svg viewBox="0 0 24 24" fill="none" className="w-full h-full text-orange-500" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="9" strokeDasharray="14 3" />
                <circle cx="12" cy="12" r="3" fill="#ea580c" />
              </svg>
            </div>
            <span className="font-bold tracking-tight text-white text-base">VISIONGUARD</span>
            <span className="px-1.5 py-0.2 rounded bg-orange-600 text-white font-mono text-[9px] font-bold">AI</span>
          </Link>
          <span className="text-[11px] font-mono text-slate-400">ACCESS PORTAL</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-800">
        <span>VisionGuard AI. Industrial Safety &amp; Incident Intelligence System.</span>
      </footer>
    </div>
  );
}
