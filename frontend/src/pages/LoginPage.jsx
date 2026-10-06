import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setEmail('officer.miller@visionguard.local');
    setPassword('SecureSafetyPassword2026!');
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded p-6 sm:p-8 shadow-md">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white tracking-tight">Safety Officer Sign In</h2>
        <p className="mt-1 text-xs text-slate-400">
          Enter your authorized credentials to access visual safety intelligence.
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="officer@workplace.com"
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Lock className="w-4 h-4" />
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded text-xs text-slate-100 placeholder-slate-400 focus:outline-hidden focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-800 disabled:text-slate-500 text-white text-xs font-semibold rounded transition-colors shadow-xs"
        >
          {loading ? (
            <span>Authenticating...</span>
          ) : (
            <>
              <span>Sign In to Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Demo Credentials Quick Fill for Judges */}
      <div className="mt-5 pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={handleQuickDemo}
          className="w-full py-1.5 px-3 bg-slate-900 hover:bg-slate-850 border border-slate-700 rounded text-[11px] font-mono text-slate-300 flex items-center justify-center gap-1.5 transition-colors"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
          <span>DEMO ACCESS: Pre-fill Evaluator Account</span>
        </button>
      </div>

      <div className="mt-6 text-center text-xs text-slate-400">
        <span>Do not have an authorized account? </span>
        <Link to="/register" className="text-orange-400 hover:text-orange-300 font-semibold">
          Register new personnel
        </Link>
      </div>
    </div>
  );
}
