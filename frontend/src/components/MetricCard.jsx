import React from 'react';

export default function MetricCard({ title, value, subtitle, icon: Icon, tone = 'default' }) {
  const toneClasses = {
    default: 'text-slate-900 border-slate-200 bg-white',
    danger: 'text-red-950 border-red-200 bg-white border-l-4 border-l-red-600',
    warning: 'text-amber-950 border-amber-200 bg-white border-l-4 border-l-amber-500',
    success: 'text-emerald-950 border-emerald-200 bg-white border-l-4 border-l-emerald-600',
    navy: 'text-slate-900 border-slate-200 bg-white border-l-4 border-l-slate-800',
  };

  const iconClasses = {
    default: 'text-slate-500 bg-slate-100',
    danger: 'text-red-600 bg-red-50',
    warning: 'text-amber-600 bg-amber-50',
    success: 'text-emerald-600 bg-emerald-50',
    navy: 'text-slate-800 bg-slate-100',
  };

  return (
    <div className={`p-4 border rounded shadow-xs ${toneClasses[tone] || toneClasses.default}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {Icon && (
          <div className={`p-1.5 rounded ${iconClasses[tone] || iconClasses.default}`}>
            <Icon className="w-4 h-4" aria-hidden="true" />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
          {value}
        </span>
      </div>
      {subtitle && (
        <p className="mt-1 text-xs text-slate-500">
          {subtitle}
        </p>
      )}
    </div>
  );
}
