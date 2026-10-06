import React from 'react';
import { ShieldAlert } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <div className="bg-slate-900 text-slate-300 text-xs px-4 py-2 flex items-center justify-between border-b border-slate-800">
      <div className="flex items-center gap-2 max-w-5xl">
        <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" aria-hidden="true" />
        <span>
          <strong className="text-slate-100 font-medium">Decision Support Advisory:</strong> AI-generated safety findings are decision-support recommendations and should be verified by qualified personnel.
        </span>
      </div>
      <span className="text-slate-400 text-[11px] hidden md:inline-block">
        Operational Integrity Guard
      </span>
    </div>
  );
}
