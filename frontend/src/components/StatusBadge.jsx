import React from 'react';
import { AlertOctagon, AlertTriangle, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export function SeverityBadge({ severity }) {
  const norm = (severity || 'low').toLowerCase();

  switch (norm) {
    case 'critical':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
          <AlertOctagon className="w-3.5 h-3.5 text-red-600" aria-hidden="true" />
          <span>Critical Severity</span>
        </span>
      );
    case 'high':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-orange-100 text-orange-900 border border-orange-200">
          <AlertTriangle className="w-3.5 h-3.5 text-orange-600" aria-hidden="true" />
          <span>High Severity</span>
        </span>
      );
    case 'medium':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
          <span>Medium Severity</span>
        </span>
      );
    case 'low':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
          <span>Low Severity</span>
        </span>
      );
  }
}

export function StatusBadge({ status }) {
  const norm = (status || 'open').toLowerCase();

  switch (norm) {
    case 'resolved':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
          <span>Resolved</span>
        </span>
      );
    case 'acknowledged':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
          <Clock className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
          <span>Acknowledged</span>
        </span>
      );
    case 'open':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" aria-hidden="true"></span>
          <span>Open</span>
        </span>
      );
  }
}
