import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { SeverityBadge } from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import { History, ArrowRight, RefreshCw, ScanEye } from 'lucide-react';

export default function AnalysesPage() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAnalyses = async () => {
    setLoading(true);
    try {
      const res = await api.getAnalyses();
      if (res.success && res.data) {
        setAnalyses(res.data.analyses || []);
      }
    } catch (err) {
      console.error('Failed to load analyses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Inspection Audit Records
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Historical log of ingested visual media, detected personnel counts, and risk profiles.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAnalyses}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <Link
            to="/analyze"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded transition-colors shadow-xs"
          >
            <ScanEye className="w-3.5 h-3.5" />
            <span>New Analysis</span>
          </Link>
        </div>
      </div>

      {/* Analyses Table */}
      <div className="bg-white border border-slate-200 rounded overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <RefreshCw className="w-6 h-6 text-orange-600 animate-spin mx-auto mb-2" />
            <p className="text-xs font-mono text-slate-500">Retrieving audit history...</p>
          </div>
        ) : analyses.length === 0 ? (
          <EmptyState
            title="No visual audits conducted yet"
            description="Process your first workplace media file to generate audit logs."
            actionLabel="Start Visual Analysis"
            actionLink="/analyze"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th scope="col" className="px-4 py-3">Audit ID</th>
                  <th scope="col" className="px-4 py-3">File Name</th>
                  <th scope="col" className="px-4 py-3">Engine</th>
                  <th scope="col" className="px-4 py-3">Risk Assessment</th>
                  <th scope="col" className="px-4 py-3">Persons</th>
                  <th scope="col" className="px-4 py-3">Incidents Created</th>
                  <th scope="col" className="px-4 py-3">Timestamp</th>
                  <th scope="col" className="px-4 py-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {analyses.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900 text-[11px]">
                      {a.display_id || a.id.substring(0, 8)}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 max-w-xs truncate">
                      {a.file_name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                        a.analysis_engine === 'Gemini Vision'
                          ? 'bg-orange-50 text-orange-800 border border-orange-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}>
                        {a.analysis_engine || 'Gemini Vision'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <SeverityBadge severity={a.overall_risk} />
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700">
                      {a.persons_detected}
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-slate-900">
                      {a.incident_count}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-500 text-[11px]">
                      {new Date(a.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        to={`/analyses/${a.id}`}
                        className="inline-flex items-center gap-1 font-semibold text-slate-900 hover:text-orange-600 transition-colors"
                      >
                        <span>Audit Record</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
