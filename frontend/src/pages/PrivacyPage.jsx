import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 text-slate-800 text-xs leading-relaxed py-6">
      <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-orange-600" />
            <span className="font-mono text-[11px] text-slate-500 uppercase font-semibold">Legal &amp; Compliance</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Privacy Policy</h1>
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
          <h2 className="text-sm font-bold text-slate-900">1. Workplace Imagery Ingestion and Processing</h2>
          <p>
            VisionGuard AI processes workplace surveillance frames, photographic evidence, and video streams provided by authorized enterprise personnel strictly for detecting safety non-compliance, equipment violations, and hazard indicators.
          </p>
          <p>
            Media uploaded to the system is evaluated through our server-side visual intelligence service. Uploaded assets are stored in protected application storage and are not shared with unauthorized third-party commercial brokers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900">2. Personnel Identity and Biometric Clarification</h2>
          <p>
            VisionGuard AI does not perform individual biometric facial recognition or track individual personal identities across shifts. Detections focus on safety equipment compliance (such as hard hats and safety vests), posture anomalies, and physical perimeter markers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900">3. Data Retention and Deletion</h2>
          <p>
            Uploaded visual files and corresponding audit logs are retained in the database per the customer enterprise retention policy. Incident logs may be reviewed, updated, and purged by authorized administrators.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900">4. Third-Party AI Services</h2>
          <p>
            Visual analysis is conducted using Google Gemini API endpoints under server-side credentials. Client-side code never communicates directly with external AI endpoints, ensuring credential safety and compliance containment.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-bold text-slate-900">5. Organization Contact Information</h2>
          <p className="bg-slate-50 p-3 rounded border border-slate-200 text-slate-600">
            For privacy inquiries or data removal requests regarding VisionGuard AI, contact your designated site administrator or email: <span className="font-mono text-slate-900">[INSERT_ORGANIZATION_CONTACT_EMAIL]</span>.
          </p>
        </section>
      </div>
    </div>
  );
}
