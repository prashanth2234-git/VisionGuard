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
  ShieldAlert,
  Users,
  MapPin,
  AlertCircle,
  Info,
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

  const findingsList = analysis.findings || analysis.incidents || [];
  const highRiskCount = findingsList.filter(
    (f) => f.severity === 'critical' || f.severity === 'high'
  ).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
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
              <span className="font-mono text-xs font-bold text-slate-900">{analysis.display_id || analysis.id.substring(0, 8)}</span>
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
            <span>Generate Audit Report</span>
          </Link>
        </div>
      </div>

      {/* Split-Screen Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* LEFT: SOURCE MEDIA VISUAL CENTER */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded p-4">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2 mb-3">
              <span>Source Workplace Media</span>
              <span className="font-mono text-[10px] text-slate-500 uppercase">
                {analysis.mime_type}
              </span>
            </div>

            <div className="rounded border border-slate-300 overflow-hidden bg-slate-950 flex items-center justify-center min-h-[340px]">
              {analysis.media_type === 'video' ? (
                <video
                  src={analysis.file_path}
                  controls
                  className="w-full max-h-[460px] object-contain"
                />
              ) : (
                <img
                  src={analysis.file_path}
                  alt={analysis.file_name}
                  className="w-full h-auto max-h-[460px] object-contain"
                />
              )}
            </div>

            {/* Source Metadata */}
            <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[11px] font-mono uppercase text-slate-400 block">Analysis ID</span>
                <span className="font-mono font-bold text-slate-900 mt-0.5 block">{analysis.display_id || analysis.id.substring(0, 8)}</span>
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase text-slate-400 block">File Name</span>
                <span className="font-medium text-slate-900 truncate mt-0.5 block" title={analysis.file_name}>
                  {analysis.file_name}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase text-slate-400 block">Analysis Engine</span>
                <span className={`inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                  analysis.analysis_engine === 'Gemini Vision'
                    ? 'bg-orange-50 text-orange-800 border border-orange-200'
                    : 'bg-slate-100 text-slate-700 border border-slate-200'
                }`}>
                  {analysis.analysis_engine || 'Gemini Vision'}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase text-slate-400 block">Timestamp</span>
                <span className="font-mono text-slate-600 text-[11px] mt-0.5 block">
                  {new Date(analysis.created_at).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase text-slate-400 block">File Size</span>
                <span className="font-mono text-slate-700 mt-0.5 block">
                  {(analysis.file_size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase text-slate-400 block">Format</span>
                <span className="font-mono text-slate-700 uppercase mt-0.5 block">
                  {analysis.media_type}
                </span>
              </div>
            </div>
          </div>

          {/* Chronological Detection Events */}
          <div className="bg-white border border-slate-200 rounded p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2 mb-3">
              <History className="w-4 h-4 text-slate-500" />
              <span>Detection Event Timeline</span>
            </div>

            {(!analysis.timeline_events || analysis.timeline_events.length === 0) ? (
              <p className="text-xs text-slate-500 py-3 text-center">
                No distinct timeline intervals recorded.
              </p>
            ) : (
              <div className="space-y-3">
                {analysis.timeline_events.map((ev, index) => (
                  <div key={ev.id || index} className="flex items-start gap-2.5 text-xs">
                    <span className="font-mono text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                      {ev.event_time || '00:00'}
                    </span>
                    <div className="flex-1">
                      <span className="font-semibold text-slate-900">{ev.event_type}</span>
                      <p className="text-slate-600 mt-0.5">{ev.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: FINDINGS & EVIDENCE */}
        <div className="space-y-4">
          {/* Summary Indicators */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white border border-slate-200 rounded p-3">
            <div className="p-2.5 rounded bg-slate-50 border border-slate-100 text-center">
              <span className="text-[10px] font-mono uppercase text-slate-500 block">People Detected</span>
              <span className="text-lg font-bold font-mono text-slate-900 mt-0.5 block">
                {analysis.persons_detected}
              </span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-100 text-center">
              <span className="text-[10px] font-mono uppercase text-slate-500 block">Findings Detected</span>
              <span className="text-lg font-bold font-mono text-slate-900 mt-0.5 block">
                {findingsList.length}
              </span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-100 text-center">
              <span className="text-[10px] font-mono uppercase text-slate-500 block">High-Risk Items</span>
              <span className="text-lg font-bold font-mono text-red-600 mt-0.5 block">
                {highRiskCount}
              </span>
            </div>
            <div className="p-2.5 rounded bg-slate-50 border border-slate-100 text-center">
              <span className="text-[10px] font-mono uppercase text-slate-500 block">Overall Risk</span>
              <div className="mt-1">
                <SeverityBadge severity={analysis.overall_risk} />
              </div>
            </div>
          </div>

          {/* Scene Summary */}
          <div className="bg-white border border-slate-200 rounded p-4">
            <span className="text-[11px] font-mono uppercase text-slate-500 font-bold block mb-1">
              Scene Summary Narrative
            </span>
            <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-200">
              {analysis.scene_summary}
            </p>
          </div>

          {/* Evidence Cards */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Visual Evidence Findings ({findingsList.length})
            </h3>

            {findingsList.length === 0 ? (
              <div className="p-6 bg-white border border-slate-200 rounded text-center text-xs text-slate-500">
                No safety violations detected. Visual scene confirmed compliant.
              </div>
            ) : (
              findingsList.map((item, idx) => (
                <div
                  key={item.id || idx}
                  className="bg-white border border-slate-200 rounded p-4 space-y-3"
                >
                  <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2.5">
                    <div>
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-900 block">
                        {item.type?.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        Confidence: <strong>{Math.round((item.confidence || 0) * 100)}%</strong>
                      </span>
                    </div>
                    <SeverityBadge severity={item.severity} />
                  </div>

                  <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">
                      Visual Evidence
                    </span>
                    <p className="text-xs text-slate-800 font-medium leading-relaxed">
                      {item.visual_evidence || item.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Location</span>
                      <span className="text-slate-700 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-orange-600 shrink-0" />
                        <span>{item.location || 'Monitored sector'}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase text-slate-400 block font-semibold">Explanation</span>
                      <span className="text-slate-700 mt-0.5 block">
                        {item.explanation || 'Protocol non-compliance in monitored workspace.'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="text-xs">
                      <span className="text-[10px] font-mono uppercase text-amber-800 font-bold block">
                        Recommended Action:
                      </span>
                      <span className="text-slate-800 font-medium">
                        {item.recommended_action}
                      </span>
                    </div>
                    {item.id && (
                      <Link
                        to={`/incidents/${item.id}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-900 hover:text-white hover:bg-slate-900 bg-slate-100 rounded border border-slate-200 transition-colors shrink-0"
                      >
                        <span>Investigate</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Risk Reasoning Section (Below Split-Screen) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border border-slate-200 rounded p-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <AlertCircle className="w-4 h-4 text-orange-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Why This Was Flagged
            </h4>
          </div>
          {analysis.why_flagged && analysis.why_flagged.length > 0 ? (
            <ul className="space-y-2 text-xs text-slate-700">
              {analysis.why_flagged.map((reason, rIdx) => (
                <li key={rIdx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-1.5 shrink-0" />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500">
              Visual conditions observed within expected parameters.
            </p>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <ShieldAlert className="w-4 h-4 text-red-600" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Risk Assessment
            </h4>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200 font-sans">
            {analysis.risk_assessment || 'Visual findings warrant ongoing compliance observation.'}
          </p>
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Decision-support assessment based on visible factors. Does not assert certainty beyond optical observations.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
