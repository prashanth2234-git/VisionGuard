import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ScanEye,
  AlertTriangle,
  History,
  FileText,
  Settings,
  ShieldCheck,
  FileQuestion,
} from 'lucide-react';

const navigationItems = [
  { name: 'Overview', to: '/dashboard', icon: LayoutDashboard },
  { name: 'Analyze', to: '/analyze', icon: ScanEye },
  { name: 'Incidents', to: '/incidents', icon: AlertTriangle },
  { name: 'Analyses', to: '/analyses', icon: History },
  { name: 'Reports', to: '/reports', icon: FileText },
  { name: 'Settings', to: '/settings', icon: Settings },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-4rem)]">
      {/* Navigation Links */}
      <nav className="p-3 space-y-1 flex-1">
        <div className="px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-400">
          Operational Workspace
        </div>
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 text-xs font-medium rounded transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white border-l-2 border-orange-500 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Safety Compliance & Regulatory Disclaimers */}
      <div className="p-4 border-t border-slate-800 text-xs">
        <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-slate-400">
          <div className="flex items-center gap-1.5 text-slate-300 font-medium mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-orange-500" aria-hidden="true" />
            <span>Industrial Protocol</span>
          </div>
          <p className="text-[11px] leading-relaxed text-slate-400">
            Automated visual telemetry assisting on-site safety compliance officers.
          </p>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/60">
          <NavLink to="/privacy" className="hover:text-slate-200">
            Privacy Policy
          </NavLink>
          <span className="text-slate-700">|</span>
          <NavLink to="/terms" className="hover:text-slate-200">
            Terms &amp; Conditions
          </NavLink>
        </div>
      </div>
    </aside>
  );
}
