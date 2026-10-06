import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { SeverityBadge, StatusBadge } from '../components/StatusBadge';
import {
  ArrowLeft,
  FileText,
  Camera,
  History,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Users,
} from 'lucide-react';

export default function AnalysisDetailPage() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRecord() {
      setLoading(true);
      try {
        const res = await api.getAnalysisById(id);
        if (res.success && res.data) {
          setAnalysis(res.data);
        }
      } catch (err) {
        setError(err.message || 'Unable to retrieve analysis details.');
      } finally {
        setLoading(false);
      }
    }
    fetchRecord();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center font-mono text-xs text-slate-500">
        Loading inspection record #{id?.substring(0, 8)}...
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800 text-xs max-w-xl mx-auto my-8">
        <p className="font-semibold">Analysis Retrieval Error</p>
        <p className="mt-1">{error || 'Record not found.'}</p>
        <Link to="/analyses" className="mt-3 inline-block font-semibold text-red-950 underline">
          &larr; Return to Analysis History
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/analyses"
            className="p-1.5 rounded bg-white border border-slate-300 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-500">AUDIT RECORD</span>
              <span className="font-mono text-xs font-bold text-slate-900">#{analysis.id.substring(0, 8)}</span>
              <SeverityBadge severity={analysis.overall_risk} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
              {analysis.file_name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/reports?analysisId=${analysis.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export Inspection Report</span>
          </Link>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Visual Media & Chronological Events */}
        <div className="lg:col-span-2 space-y-6">
          {/* Media Player / Image Viewer */}
          <div className="bg-white border border-slate-200 rounded p-4">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2 mb-3">
              <div className="flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-slate-500" />
                <span>Ingested Workplace Media</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400 uppercase">
                {analysis.mime_type}
              </span>
            </div>

            <div className="rounded border border-slate-200 overflow-hidden bg-slate-950 max-h-96 flex items-center justify-center">
              {analysis.media_type === 'video' ? (
                <video
                  src={analysis.file_path}
                  controls
                  className="w-full max-h-96 object-contain"
                >
                  Your browser does not support HTML5 video preview.
                </video>
              ) : (
                <img
                  src={analysis.file_path}
                  alt={analysis.file_name}
                  className="w-full h-auto object-contain max-h-96"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
              <div><strong>Size:</strong> {(analysis.file_size / 1024 / 1024).toFixed(2)} MB</div>
              <div><strong>Audit Timestamp:</strong> {new Date(analysis.created_at).toLocaleString()}</div>
            </div>
          </div>

          {/* Chronological Detection Events */}
          <div className="bg-white border border-slate-200 rounded p-5">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2 mb-4">
              <History className="w-4 h-4 text-slate-500" />
              <span>Chronological Detection Timeline</span>
            </div>

            {(!analysis.timeline_events || analysis.timeline_events.length === 0) ? (
              <p className="text-xs text-slate-500 text-center py-4">
                No distinct timeline events logged for this scan.
              </p>
            ) : (
              <div className="space-y-4">
                {analysis.timeline_events.map((ev, index) => (
                  <div key={ev.id || index} className="flex items-start gap-3">
                    <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                      {ev.event_time || '00:00'}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-900">{ev.event_type}</span>
                        {ev.severity === 'critical' && (
                          <span className="w-2 h-2 rounded-full bg-red-600" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{ev.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Scene Findings & Created Incidents */}
        <div className="space-y-6">
          {/* Executive Scene Summary */}
          <div className="bg-white border border-slate-200 rounded p-4 space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
              Scene Assessment
            </h3>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Personnel Detected:</span>
              <span className="font-mono font-bold text-slate-900">{analysis.persons_detected}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Overall Sector Risk:</span>
              <SeverityBadge severity={analysis.overall_risk} />
            </div>

            <div>
              <span className="text-[11px] font-mono uppercase text-slate-400 font-bold block mb-1">
                Visual Context
              </span>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200">
                {analysis.scene_summary}
              </p>
            </div>

            {analysis.recommended_actions && analysis.recommended_actions.length > 0 && (
              <div>
                <span className="text-[11px] font-mono uppercase text-slate-400 font-bold block mb-1">
                  Safety Protocol Directives
                </span>
                <ul className="text-xs text-slate-700 space-y-1.5 list-disc list-inside">
                  {analysis.recommended_actions.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Generated Incidents */}
          <div className="bg-white border border-slate-200 rounded p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2 mb-3">
              Generated Incidents ({analysis.incidents?.length || 0})
            </h3>

            {(!analysis.incidents || analysis.incidents.length === 0) ? (
              <p className="text-xs text-slate-500 text-center py-4">
                No compliance incidents logged. Area verified clear.
              </p>
            ) : (
              <div className="space-y-3">
                {analysis.incidents.map((inc) => (
                  <div key={inc.id} className="p-3 rounded bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs text-slate-900 capitalize font-mono">
                        {inc.type.replace(/_/g, ' ')}
                      </span>
                      <StatusBadge status={inc.status} />
                    </div>
                    <SeverityBadge severity={inc.severity} />
                    <p className="text-xs text-slate-600 line-clamp-2">{inc.description}</p>
                    <div className="pt-1 flex justify-end">
                      <Link
                        to={`/incidents/${inc.id}`}
                        className="text-xs font-medium text-orange-600 hover:text-orange-700 inline-flex items-center gap-1"
                      >
                        <span>Investigate Dossier</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
