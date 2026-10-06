import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import MetricCard from '../components/MetricCard';
import { SeverityBadge, StatusBadge } from '../components/StatusBadge';
import EmptyState from '../components/EmptyState';
import {
  FileSpreadsheet,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  ScanEye,
  ArrowRight,
  RefreshCw,
  Clock,
  Layers,
} from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getStats();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      setError(err.message || 'Unable to retrieve operations telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="py-16 text-center">
        <RefreshCw className="w-6 h-6 text-orange-600 animate-spin mx-auto mb-2" />
        <p className="text-xs font-mono text-slate-500">Querying database metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800 text-xs">
        <p className="font-semibold">Telemetry query error</p>
        <p className="mt-1">{error}</p>
        <button
          onClick={fetchStats}
          className="mt-3 px-3 py-1 bg-red-600 text-white rounded font-medium hover:bg-red-700"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const {
    overview = { total_analyses: 0, open_incidents: 0, critical_incidents: 0, resolved_incidents: 0 },
    risk_distribution = { critical: 0, high: 0, medium: 0, low: 0 },
    incident_types = [],
    recent_incidents = [],
    recent_analyses = [],
  } = stats || {};

  const totalIncidents = (overview.total_incidents !== undefined)
    ? overview.total_incidents
    : (risk_distribution.critical + risk_distribution.high + risk_distribution.medium + risk_distribution.low);

  return (
    <div className="space-y-6">
      {/* Top Operational Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Safety Operations Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time visual surveillance metrics and incident telemetry.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchStats}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
            title="Refresh database metrics"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Telemetry</span>
          </button>
          <Link
            to="/analyze"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 rounded transition-colors shadow-xs"
          >
            <ScanEye className="w-3.5 h-3.5" />
            <span>New Visual Analysis</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid (All real DB data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Analyses"
          value={overview.total_analyses}
          subtitle="Processed image & video batches"
          icon={Layers}
          tone="navy"
        />
        <MetricCard
          title="Open Incidents"
          value={overview.open_incidents}
          subtitle="Pending safety officer action"
          icon={AlertTriangle}
          tone={overview.open_incidents > 0 ? 'warning' : 'default'}
        />
        <MetricCard
          title="Critical Incidents"
          value={overview.critical_incidents}
          subtitle="Immediate work stop required"
          icon={AlertOctagon}
          tone={overview.critical_incidents > 0 ? 'danger' : 'default'}
        />
        <MetricCard
          title="Resolved Incidents"
          value={overview.resolved_incidents}
          subtitle="Remediated & verified compliance"
          icon={CheckCircle2}
          tone="success"
        />
      </div>

      {/* Secondary Metrics: Risk Distribution & Type Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real Risk Distribution */}
        <div className="bg-white border border-slate-200 rounded p-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Severity Risk Distribution
            </h2>
            <span className="text-[11px] font-mono text-slate-400">
              {totalIncidents} Total Logged
            </span>
          </div>

          {totalIncidents === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              No analysis data yet. Upload workplace media to generate risk telemetry.
            </p>
          ) : (
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5 text-red-700">
                    <span className="w-2 h-2 rounded-full bg-red-600" />
                    Critical Risk
                  </span>
                  <span className="font-mono">{risk_distribution.critical}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${totalIncidents ? (risk_distribution.critical / totalIncidents) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5 text-orange-700">
                    <span className="w-2 h-2 rounded-full bg-orange-500" />
                    High Risk
                  </span>
                  <span className="font-mono">{risk_distribution.high}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${totalIncidents ? (risk_distribution.high / totalIncidents) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5 text-amber-700">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Medium Risk
                  </span>
                  <span className="font-mono">{risk_distribution.medium}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-amber-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${totalIncidents ? (risk_distribution.medium / totalIncidents) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Low Risk
                  </span>
                  <span className="font-mono">{risk_distribution.low}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${totalIncidents ? (risk_distribution.low / totalIncidents) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Real Incident Types Breakdown */}
        <div className="bg-white border border-slate-200 rounded p-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Detected Incident Classifications
            </h2>
            <span className="text-[11px] font-mono text-slate-400">Database Aggregate</span>
          </div>

          {incident_types.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">
              No analysis data yet. Process visual scans to populate categories.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {incident_types.map((item) => (
                <div key={item.type} className="py-2 flex items-center justify-between text-xs">
                  <span className="font-mono text-slate-800 capitalize">
                    {item.type.replace(/_/g, ' ')}
                  </span>
                  <span className="font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Incidents Table */}
      <div className="bg-white border border-slate-200 rounded">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Recent Safety Incidents
            </h2>
            <p className="text-[11px] text-slate-500">
              Latest items extracted from visual inspection analyses
            </p>
          </div>
          <Link
            to="/incidents"
            className="text-xs font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            <span>View All Incidents</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recent_incidents.length === 0 ? (
          <EmptyState
            title="No incidents detected yet"
            description="Run a visual inspection on workplace media to detect hazards, PPE violations, and falls."
            actionLabel="Analyze First Media File"
            actionLink="/analyze"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs divide-y divide-slate-200">
              <thead className="bg-slate-50 text-slate-600 font-semibold">
                <tr>
                  <th scope="col" className="px-4 py-2.5">Severity</th>
                  <th scope="col" className="px-4 py-2.5">Type</th>
                  <th scope="col" className="px-4 py-2.5">Location</th>
                  <th scope="col" className="px-4 py-2.5">Status</th>
                  <th scope="col" className="px-4 py-2.5">Confidence</th>
                  <th scope="col" className="px-4 py-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {recent_incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <SeverityBadge severity={inc.severity} />
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap font-medium capitalize">
                      {inc.type.replace(/_/g, ' ')}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-slate-600">
                      {inc.location || 'Observed sector'}
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap">
                      <StatusBadge status={inc.status} />
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap font-mono text-slate-600">
                      {Math.round((inc.confidence || 0) * 100)}%
                    </td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-right">
                      <Link
                        to={`/incidents/${inc.id}`}
                        className="inline-flex items-center gap-1 font-medium text-slate-900 hover:text-orange-600"
                      >
                        <span>Investigate</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Analyses Activity */}
      <div className="bg-white border border-slate-200 rounded">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Recent Visual Analyses
            </h2>
            <p className="text-[11px] text-slate-500">
              Inspection audit records stored in database
            </p>
          </div>
          <Link
            to="/analyses"
            className="text-xs font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            <span>Audit History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recent_analyses.length === 0 ? (
          <p className="text-xs text-slate-500 p-6 text-center">
            No analyses executed yet.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {recent_analyses.map((a) => (
              <div key={a.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-900">{a.file_name}</span>
                    <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                      {a.media_type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                    {a.scene_summary || 'Visual scan completed'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <SeverityBadge severity={a.overall_risk} />
                  <span className="text-xs font-mono text-slate-600 whitespace-nowrap">
                    {a.incident_count} incident(s)
                  </span>
                  <Link
                    to={`/analyses/${a.id}`}
                    className="text-xs font-medium text-slate-900 hover:text-orange-600 whitespace-nowrap"
                  >
                    Details &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
