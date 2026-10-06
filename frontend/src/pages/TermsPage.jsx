import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldAlert } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-800 text-xs leading-relaxed py-6">
      <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-4 h-4 text-orange-600" />
            <span className="font-mono text-[11px] text-slate-500 uppercase font-semibold">Legal &amp; Compliance</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Terms &amp; Conditions</h1>
          <p className="text-slate-500 mt-0.5">Last updated: October 2026</p>
        </div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Console</span>
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded p-6 sm:p-8 space-y-6">
        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900">1. Nature of the Software and Decision-Support Scope</h2>
          <p>
            VisionGuard AI is decision-support software intended to assist qualified industrial safety officers in detecting visible workplace anomalies.
          </p>
          <p className="font-semibold text-slate-900">
            THE SOFTWARE DOES NOT REPLACE QUALIFIED HUMAN SAFETY INSPECTORS OR STATUTORY REGULATORY BODIES.
          </p>
          <p>
            The software does not provide medical, legal, or guaranteed life-safety certifications. Detections are probabilistic computer vision outputs and should always be verified by designated on-site safety personnel before executive action is finalized.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900">2. Acceptable Workplace Use</h2>
          <p>
            Users agree to use VisionGuard AI exclusively in industrial, construction, and manufacturing environments where the operator possesses authorized surveillance and inspection consent.
          </p>
          <p>
            The system must not be deployed for unlawful surveillance, harassment, discriminatory labor targeting, or unauthorized biometric cataloging.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900">3. Limitation of Liability</h2>
          <p>
            In no event shall the software authors, developers, or operators be liable for indirect, incidental, or consequential damages resulting from false positives, false negatives, equipment failure, or industrial workplace incidents.
          </p>
          <p>
            Site safety officers retain full responsibility for maintaining workplace standards in accordance with applicable regional occupational health and safety legislation.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900">4. Legal Entity Information</h2>
          <p className="bg-slate-50 p-3 rounded border border-slate-200 text-slate-600">
            Enterprise Operator: <span className="font-mono text-slate-900">[INSERT_OPERATING_COMPANY_LEGAL_NAME]</span>
            <br />
            Registered Jurisdiction: <span className="font-mono text-slate-900">[INSERT_OPERATING_JURISDICTION]</span>
            <br />
            Support Contact: <span className="font-mono text-slate-900">[INSERT_SUPPORT_CONTACT_EMAIL]</span>
          </p>
        </section>
      </div>
    </div>
  );
}
