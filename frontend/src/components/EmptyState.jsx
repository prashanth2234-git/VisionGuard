import React from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  title = 'No records found',
  description = 'No activity or findings have been recorded yet in this workspace.',
  actionLabel,
  actionLink,
  icon: Icon = ShieldCheck,
}) {
  return (
    <div className="text-center py-12 px-4 border border-dashed border-slate-300 rounded bg-white max-w-xl mx-auto my-6">
      <div className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center mx-auto text-slate-500 mb-3">
        <Icon className="w-6 h-6" aria-hidden="true" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">{description}</p>
      {actionLabel && actionLink && (
        <div className="mt-5">
          <Link
            to={actionLink}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded transition-colors shadow-xs"
          >
            <span>{actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  );
}
