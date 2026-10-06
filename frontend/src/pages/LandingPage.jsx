import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  HardHat,
  Eye,
  AlertTriangle,
  Flame,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  Database,
  Cpu,
  FileCheck2,
} from 'lucide-react';
import DisclaimerBanner from '../components/DisclaimerBanner';
import Navbar from '../components/Navbar';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <DisclaimerBanner />
      <Navbar />

      {/* Hero Section */}
      <section className="border-b border-slate-800 bg-slate-950 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-900 border border-slate-800 text-xs font-mono text-orange-400 mb-6">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span>COMPUTER VISION &amp; VISUAL INTELLIGENCE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white uppercase font-sans">
            VisionGuard AI
          </h1>
          <p className="mt-3 text-lg sm:text-xl font-medium text-slate-300">
            Autonomous Industrial Safety &amp; Incident Intelligence
          </p>

          <p className="mt-6 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Analyze workplace footage for PPE non-compliance, restricted zone violations, worker falls, and visual hazards, then convert findings into actionable severity-ranked incidents.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/analyze"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded transition-colors shadow-xs"
            >
              <span>Analyze Workplace Media</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
            <Link
              to="/incidents"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded transition-colors"
            >
              <span>View Incidents</span>
            </Link>
          </div>

          {/* Quick verification pill */}
          <div className="mt-12 pt-8 border-t border-slate-900 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Multi-Class Safety Vision</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Structured Schema Validation</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Supabase PostgreSQL Storage</span>
            </div>
          </div>
        </div>
      </section>

      {/* Focus Inspection Modules */}
      <section className="py-16 bg-slate-900 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-mono uppercase tracking-wider text-orange-400">
              Visual Inspection Scope
            </h2>
            <p className="mt-2 text-2xl font-bold text-white tracking-tight">
              Targeted Industrial Safety Hazard Models
            </p>
            <p className="mt-3 text-xs sm:text-sm text-slate-400">
              Rather than generic detection, VisionGuard focuses on concrete workplace risks that cause severe accidents and OSHA citations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-5 rounded bg-slate-950 border border-slate-800">
              <div className="w-9 h-9 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-orange-500 mb-4">
                <HardHat className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">1. Missing Safety Helmet</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Detects personnel entering active construction sectors, scaffold bays, or overhead danger zones without compliant protective hard hats.
              </p>
            </div>

            <div className="p-5 rounded bg-slate-950 border border-slate-800">
              <div className="w-9 h-9 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-orange-500 mb-4">
                <UserCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">2. Missing Safety Vest</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Flags personnel walking in traffic lanes, logistics bays, or heavy vehicle corridors lacking high-visibility class 2 or class 3 vests.
              </p>
            </div>

            <div className="p-5 rounded bg-slate-950 border border-slate-800">
              <div className="w-9 h-9 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-orange-500 mb-4">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">3. Restricted Zone Violation</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Monitors physical demarcations, crane travel perimeters, and high-voltage zones for unauthorized intrusion during active cycles.
              </p>
            </div>

            <div className="p-5 rounded bg-slate-950 border border-slate-800">
              <div className="w-9 h-9 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-red-500 mb-4">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">4. Possible Worker Fall</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Identifies horizontal body posture, recumbent positions on walkways, or sudden elevation drops indicating potential falls or collapse.
              </p>
            </div>

            <div className="p-5 rounded bg-slate-950 border border-slate-800">
              <div className="w-9 h-9 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-red-500 mb-4">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">5. Smoke / Fire Hazard</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Recognizes abnormal visual particulate plumes, dense fume discharges, or early thermal combustion signatures in equipment bays.
              </p>
            </div>

            <div className="p-5 rounded bg-slate-950 border border-slate-800">
              <div className="w-9 h-9 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-500 mb-4">
                <Eye className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-semibold text-white">6. General Safety Anomaly</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Identifies blocked emergency egress pathways, unsecured portable ladders, and uncontained liquid spill risks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Operational Incident Lifecycle */}
      <section className="py-16 bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-xs font-mono uppercase tracking-wider text-orange-400">
              Autonomous Pipeline
            </h2>
            <p className="mt-2 text-2xl font-bold text-white tracking-tight">
              From Visual Ingestion to Safety Resolution
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded bg-slate-900 border border-slate-800">
              <div className="text-xs font-mono text-orange-500 font-bold mb-2">STEP 01</div>
              <h4 className="text-sm font-semibold text-white">Media Ingestion</h4>
              <p className="mt-2 text-xs text-slate-400">
                Workplace inspection imagery or video is validated and processed securely.
              </p>
            </div>

            <div className="p-4 rounded bg-slate-900 border border-slate-800">
              <div className="text-xs font-mono text-orange-500 font-bold mb-2">STEP 02</div>
              <h4 className="text-sm font-semibold text-white">Vision Inference</h4>
              <p className="mt-2 text-xs text-slate-400">
                AI visual models detect anomalies and produce structured schema findings.
              </p>
            </div>

            <div className="p-4 rounded bg-slate-900 border border-slate-800">
              <div className="text-xs font-mono text-orange-500 font-bold mb-2">STEP 03</div>
              <h4 className="text-sm font-semibold text-white">Incident Generation</h4>
              <p className="mt-2 text-xs text-slate-400">
                Findings are ranked by severity, confidence, and location with recommended directives.
              </p>
            </div>

            <div className="p-4 rounded bg-slate-900 border border-slate-800">
              <div className="text-xs font-mono text-orange-500 font-bold mb-2">STEP 04</div>
              <h4 className="text-sm font-semibold text-white">Investigation &amp; Audit</h4>
              <p className="mt-2 text-xs text-slate-400">
                Safety officers acknowledge, resolve, and export formal compliance reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 py-6 bg-slate-950 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">VisionGuard AI</span>
            <span className="text-slate-600">|</span>
            <span>Autonomous Industrial Safety &amp; Incident Intelligence</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-slate-200">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-slate-200">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
