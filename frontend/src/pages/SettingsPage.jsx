import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Settings, Database, Cpu, ShieldCheck, User, HardHat, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const [healthData, setHealthData] = useState(null);

  useEffect(() => {
    async function loadHealth() {
      try {
        const res = await api.getHealth();
        if (res.success && res.data) {
          setHealthData(res.data);
        }
      } catch (err) {
        console.error('Failed to load system health:', err);
      }
    }
    loadHealth();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">
          System &amp; Workspace Configuration
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review system engine parameters, database connectivity, and safety officer profile.
        </p>
      </div>

      {/* User Identity Section */}
      <div className="bg-white border border-slate-200 rounded p-5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
          <User className="w-4 h-4 text-orange-600" />
          <span>Active Personnel Profile</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-500 block">Officer Name</span>
            <span className="font-semibold text-slate-900 mt-0.5 block">{user?.name || 'Authorized Personnel'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Email Address</span>
            <span className="font-mono text-slate-900 mt-0.5 block">{user?.email || 'N/A'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Assigned Role</span>
            <span className="font-mono text-slate-900 capitalize mt-0.5 block">
              {user?.role ? user.role.replace('_', ' ') : 'Safety Officer'}
            </span>
          </div>
        </div>
      </div>

      {/* Engine & Database Telemetry */}
      <div className="bg-white border border-slate-200 rounded p-5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
          <Database className="w-4 h-4 text-orange-600" />
          <span>Infrastructure &amp; AI Engine Parameters</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 block font-medium">Database Backend</span>
            <span className="font-mono font-bold text-slate-900 capitalize block">
              {healthData?.database_type ? `${healthData.database_type.toUpperCase()} Storage Engine` : 'PostgreSQL / Supabase Ready'}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">
              Supports Supabase PostgreSQL connection string via DATABASE_URL with resilient automatic local fallback.
            </p>
          </div>

          <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 block font-medium">Computer Vision Intelligence</span>
            <span className="font-mono font-bold text-slate-900 block">
              Google Gemini Vision (1.5 Flash)
            </span>
            <p className="text-[11px] text-slate-500 mt-1">
              Structured JSON schema validation for multi-class industrial safety hazard analysis.
            </p>
          </div>

          <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 block font-medium">Media Upload Boundary</span>
            <span className="font-mono font-bold text-slate-900 block">
              25 MB Maximum File Size
            </span>
            <p className="text-[11px] text-slate-500 mt-1">
              Supports JPEG, PNG, WEBP, MP4, WEBM with MIME-type verification and UUID storage isolation.
            </p>
          </div>

          <div className="p-3 rounded bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 block font-medium">System Telemetry Status</span>
            <span className="font-mono font-bold text-emerald-700 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{healthData?.status ? healthData.status.toUpperCase() : 'OPERATIONAL'}</span>
            </span>
            <p className="text-[11px] text-slate-500 mt-1 font-mono">
              Timestamp: {healthData?.timestamp ? new Date(healthData.timestamp).toLocaleString() : 'Active'}
            </p>
          </div>
        </div>
      </div>

      {/* Safety Policy Parameters */}
      <div className="bg-white border border-slate-200 rounded p-5 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
          <HardHat className="w-4 h-4 text-orange-600" />
          <span>Active Safety Rules Engine</span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span className="text-slate-800">Hard Hat Non-Compliance (PPE Rule 101)</span>
            <span className="font-mono text-orange-600 font-semibold">HIGH SEVERITY</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span className="text-slate-800">High-Visibility Vest Absence (PPE Rule 102)</span>
            <span className="font-mono text-amber-600 font-semibold">MEDIUM SEVERITY</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span className="text-slate-800">Crane / Machinery Restricted Perimeter Intrusion</span>
            <span className="font-mono text-orange-600 font-semibold">HIGH SEVERITY</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-slate-100">
            <span className="text-slate-800">Worker Slip, Trip, or Recumbent Posture Fall</span>
            <span className="font-mono text-red-600 font-semibold">CRITICAL SEVERITY</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-slate-800">Airborne Smoke / Thermal Vapor Signature</span>
            <span className="font-mono text-red-600 font-semibold">CRITICAL SEVERITY</span>
          </div>
        </div>
      </div>
    </div>
  );
}
