import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { SeverityBadge, StatusBadge } from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import {
  AlertTriangle,
  Search,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (severityFilter) params.append('severity', severityFilter);
      params.append('limit', '50');

      const res = await api.getIncidents(params.toString());
      if (res.success && res.data) {
        setIncidents(res.data.incidents || []);
        setTotal(res.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to load incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [statusFilter, severityFilter]);

  const filteredIncidents = incidents.filter((inc) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (inc.description && inc.description.toLowerCase().includes(term)) ||
      (inc.visual_evidence && inc.visual_evidence.toLowerCase().includes(term)) ||
      (inc.location && inc.location.toLowerCase().includes(term)) ||
      (inc.display_id && inc.display_id.toLowerCase().includes(term)) ||
      (inc.type && inc.type.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Workplace Safety Incidents
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Active and resolved compliance violations generated from computer vision audits.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchIncidents}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <Link
            to="/analyze"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded transition-colors shadow-xs"
          >
            <span>Run New Audit</span>
          </Link>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded p-3 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-hidden focus:border-orange-500"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-medium">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded px-2.5 py-1 text-xs text-slate-800 focus:outline-hidden focus:border-orange-500"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search ID, finding, location, type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-slate-50 border border-slate-300 rounded text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-orange-500"
          />
        </div>
      </div>

      {/* Incident List Table */}
      <div className="bg-white border border-slate-200 rounded overflow-hidden">
        {loading ? (
          <div className="py-16 text-center">
            <RefreshCw className="w-6 h-6 text-orange-600 animate-spin mx-auto mb-2" />
            <p className="text-xs font-mono text-slate-500">Retrieving incident registry...</p>
          </div>
        ) : filteredIncidents.length === 0 ? (
          <EmptyState
            title="No incidents recorded"
            description="Incidents generated from completed visual analyses will appear here."
            actionLabel="Analyze Media"
            actionLink="/analyze"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th scope="col" className="px-4 py-3">Incident ID</th>
                  <th scope="col" className="px-4 py-3">Severity</th>
                  <th scope="col" className="px-4 py-3">Classification</th>
                  <th scope="col" className="px-4 py-3">Visual Evidence &amp; Finding</th>
                  <th scope="col" className="px-4 py-3">Confidence</th>
                  <th scope="col" className="px-4 py-3">Status</th>
                  <th scope="col" className="px-4 py-3">Logged</th>
                  <th scope="col" className="px-4 py-3 text-right">Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {filteredIncidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-[11px] font-bold text-slate-900">
                      {inc.display_id || `INC-${inc.id.substring(0, 8)}`}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <SeverityBadge severity={inc.severity} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-900 capitalize font-mono">
                      {inc.type.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-3 max-w-md">
                      <div className="font-medium text-slate-900 truncate">
                        {inc.visual_evidence || inc.description}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Sector: {inc.location || 'Visual field sector'}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-slate-700">
                      {Math.round((inc.confidence || 0) * 100)}%
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={inc.status} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500 text-[11px] font-mono">
                      {new Date(inc.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <Link
                        to={`/incidents/${inc.id}`}
                        className="inline-flex items-center gap-1 font-semibold text-slate-900 hover:text-orange-600 transition-colors"
                      >
                        <span>Investigate</span>
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
