import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { SeverityBadge, StatusBadge } from '../components/StatusBadge';
import {
  ShieldAlert,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  FileText,
  UserCheck,
  Send,
  Camera,
  History,
  AlertCircle,
  Info,
} from 'lucide-react';

export default function IncidentDetailPage() {
  const { id } = useParams();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [status, setStatus] = useState('open');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [statusSuccessMessage, setStatusSuccessMessage] = useState('');

  const fetchIncident = async () => {
    setLoading(true);
    try {
      const res = await api.getIncidentById(id);
      if (res.success && res.data) {
        setIncident(res.data);
        setStatus(res.data.status || 'open');
        setResolutionNotes(res.data.resolution_notes || '');
      }
    } catch (err) {
      setError(err.message || 'Unable to load incident record.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncident();
  }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setSavingStatus(true);
    setStatusSuccessMessage('');

    try {
      const res = await api.updateIncidentStatus(id, {
        status,
        resolution_notes: resolutionNotes,
      });
      if (res.success && res.data) {
        setIncident(res.data);
        setStatusSuccessMessage(`Incident marked as ${status.toUpperCase()} successfully.`);
        setTimeout(() => setStatusSuccessMessage(''), 4000);
      }
    } catch (err) {
      alert('Failed to update incident: ' + err.message);
    } finally {
      setSavingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center font-mono text-xs text-slate-500">
        Loading safety dossier #{id?.substring(0, 8)}...
      </div>
    );
  }

  if (error || !incident) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800 text-xs max-w-xl mx-auto my-8">
        <p className="font-semibold">Incident Retrieval Error</p>
        <p className="mt-1">{error || 'Incident record could not be found.'}</p>
        <Link to="/incidents" className="mt-3 inline-block font-semibold text-red-950 underline">
          &larr; Return to Incidents List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/incidents"
            className="p-1.5 rounded bg-white border border-slate-300 text-slate-600 hover:text-slate-900 transition-colors"
            title="Return to incidents list"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-slate-500">INCIDENT DOSSIER</span>
              <span className="font-mono text-xs font-bold text-slate-900">{incident.display_id || incident.id.substring(0, 8)}</span>
              <StatusBadge status={incident.status} />
              <SeverityBadge severity={incident.severity} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1 capitalize">
              {incident.type.replace(/_/g, ' ')}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to={`/reports?incidentId=${incident.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Generate Audit Report</span>
          </Link>
        </div>
      </div>

      {statusSuccessMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{statusSuccessMessage}</span>
        </div>
      )}

      {/* Main Grid: Left investigation answers, Right media & status update */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Visual Findings & Evidence */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Visual Finding &amp; Evidence
              </h2>
              <span className="text-[11px] font-mono text-slate-400">
                Confidence: {Math.round((incident.confidence || 0) * 100)}%
              </span>
            </div>

            {/* WHAT happened */}
            <div>
              <span className="text-[11px] font-mono uppercase text-slate-400 font-bold block">
                WHAT happened?
              </span>
              <p className="text-sm font-medium text-slate-900 mt-0.5">
                {incident.description}
              </p>
            </div>

            {/* Visual Evidence Section */}
            <div className="bg-slate-50 p-3 rounded border border-slate-200 space-y-1">
              <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">
                Visual Evidence
              </span>
              <p className="text-xs text-slate-800 font-medium leading-relaxed">
                {incident.visual_evidence || incident.description}
              </p>
            </div>

            {/* WHERE did it happen */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <span className="text-[11px] font-mono uppercase text-slate-400 font-bold block">
                  WHERE did it happen?
                </span>
                <div className="flex items-center gap-1.5 text-xs text-slate-700 mt-0.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span>{incident.location || 'Monitored sector within visual frame'}</span>
                </div>
              </div>

              <div>
                <span className="text-[11px] font-mono uppercase text-slate-400 font-bold block">
                  Analysis Engine
                </span>
                <span className="font-mono text-xs text-slate-700 mt-0.5 block">
                  {incident.analysis_engine || 'Gemini Vision'}
                </span>
              </div>
            </div>

            {/* WHY is it considered risky */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[11px] font-mono uppercase text-slate-400 font-bold block">
                WHY is it considered risky?
              </span>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                {incident.explanation || (
                  incident.severity === 'critical'
                    ? 'Presents immediate danger to life or physical impairment (fall, thermal event) requiring immediate halt.'
                    : 'Non-compliance with required safety safeguards capable of causing preventable workplace injury.'
                )}
              </p>
            </div>

            {/* WHAT should the safety officer do next */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded">
              <span className="text-[11px] font-mono uppercase text-amber-900 font-bold block">
                WHAT should the safety officer do next?
              </span>
              <p className="text-xs text-amber-950 font-medium mt-1 leading-relaxed">
                {incident.recommended_action}
              </p>
            </div>
          </div>

          {/* Timeline Events */}
          {incident.timeline_events && incident.timeline_events.length > 0 && (
            <div className="bg-white border border-slate-200 rounded p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2 mb-4">
                <History className="w-4 h-4 text-slate-500" />
                <span>Detection Event Timeline</span>
              </div>

              <div className="space-y-3">
                {incident.timeline_events.map((ev, index) => (
                  <div key={ev.id || index} className="flex items-start gap-3 text-xs">
                    <span className="font-mono text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded shrink-0">
                      {ev.event_time || '00:00'}
                    </span>
                    <div className="flex-1">
                      <span className="font-semibold text-slate-900">{ev.event_type}</span>
                      <p className="text-slate-600 mt-0.5">{ev.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Source Media Preview & Status Management */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded p-4">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2 mb-3">
              <div className="flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-slate-500" />
                <span>Source Workplace Media</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400 capitalize">
                {incident.media_type || 'image'}
              </span>
            </div>

            <div className="rounded border border-slate-200 overflow-hidden bg-slate-950 max-h-56 flex items-center justify-center">
              {incident.file_path ? (
                <img
                  src={incident.file_path}
                  alt="Workplace source frame"
                  className="w-full h-auto object-contain max-h-56"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 font-mono">
                  No visual file stream available
                </div>
              )}
            </div>

            <div className="mt-3 text-[11px] text-slate-500 space-y-0.5">
              <div><strong className="text-slate-700">Analysis:</strong> {incident.analysis_display_id || incident.analysis_id?.substring(0, 8)}</div>
              <div><strong className="text-slate-700">Filename:</strong> {incident.file_name}</div>
              <div><strong className="text-slate-700">Logged:</strong> {new Date(incident.created_at).toLocaleString()}</div>
              {incident.resolved_at && (
                <div className="text-emerald-700 pt-1">
                  <strong>Resolved at:</strong> {new Date(incident.resolved_at).toLocaleString()}
                </div>
              )}
            </div>
          </div>

          {/* Incident Status Management */}
          <div className="bg-white border border-slate-200 rounded p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2 mb-3">
              Safety Officer Incident Protocol
            </h3>

            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Incident Status Transition
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded text-xs text-slate-900 focus:outline-hidden focus:border-orange-500"
                >
                  <option value="open">Open (Investigation Required)</option>
                  <option value="acknowledged">Acknowledged (Officer In Route)</option>
                  <option value="resolved">Resolved (Compliance Restored)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Safety Officer Resolution Notes
                </label>
                <textarea
                  rows={4}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Record corrective actions taken (e.g. Stop work order issued, compliant hard hat provided, area cleared)..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <button
                type="submit"
                disabled={savingStatus}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded text-xs font-semibold transition-colors"
              >
                {savingStatus ? (
                  <span>Updating Database...</span>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Commit Incident Status Update</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
