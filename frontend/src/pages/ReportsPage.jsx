import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { SeverityBadge, StatusBadge } from '../components/StatusBadge';
import { Printer, Download, FileText, CheckCircle2, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function ReportsPage() {
  const [searchParams] = useSearchParams();
  const initialIncidentId = searchParams.get('incidentId');
  const initialAnalysisId = searchParams.get('analysisId');

  const [incidents, setIncidents] = useState([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState(initialIncidentId || '');
  const [activeIncident, setActiveIncident] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await api.getIncidents('limit=100');
        if (res.success && res.data) {
          const list = res.data.incidents || [];
          setIncidents(list);
          if (list.length > 0) {
            const targetId = initialIncidentId || list[0].id;
            setSelectedIncidentId(targetId);
            const found = list.find((i) => i.id === targetId) || list[0];
            setActiveIncident(found);
          }
        }
      } catch (err) {
        console.error('Failed to load incident reports:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [initialIncidentId]);

  const handleSelectChange = async (e) => {
    const id = e.target.value;
    setSelectedIncidentId(id);
    const found = incidents.find((i) => i.id === id);
    if (found) {
      setActiveIncident(found);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Bar for Screen */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Safety Compliance Report Generator
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Formal industrial safety audit documentation for OSHA verification and operations management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {incidents.length > 0 && (
            <select
              value={selectedIncidentId}
              onChange={handleSelectChange}
              className="bg-white border border-slate-300 rounded px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden"
            >
              {incidents.map((inc) => (
                <option key={inc.id} value={inc.id}>
                  #{inc.id.substring(0, 8)}: {inc.type.replace(/_/g, ' ')} ({inc.severity})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={handlePrint}
            disabled={!activeIncident}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded text-xs font-semibold shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Sheet */}
      {loading ? (
        <div className="py-20 text-center font-mono text-xs text-slate-500">
          Compiling compliance document...
        </div>
      ) : !activeIncident ? (
        <div className="p-8 text-center text-slate-500 text-xs border border-dashed border-slate-300 rounded bg-white">
          No incident records available to generate reports. Please conduct a visual inspection first.
        </div>
      ) : (
        <div className="bg-white border border-slate-300 shadow-sm rounded-sm p-8 sm:p-12 text-slate-900 print:border-none print:shadow-none print:p-0">
          {/* Official Document Header */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-slate-900">VISIONGUARD AI</span>
                <span className="px-1.5 py-0.5 bg-orange-600 text-white font-mono text-[9px] uppercase font-bold">
                  INCIDENT INTELLIGENCE
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                Autonomous Industrial Safety Verification System
              </p>
            </div>
            <div className="text-right font-mono text-[11px] text-slate-600">
              <div>REPORT ID: VG-AUDIT-{activeIncident.id.substring(0, 8).toUpperCase()}</div>
              <div>DATE: {new Date(activeIncident.created_at).toLocaleDateString()}</div>
              <div>STATUS: {activeIncident.status.toUpperCase()}</div>
            </div>
          </div>

          {/* Document Title */}
          <div className="mb-6">
            <h2 className="text-lg font-bold uppercase tracking-tight text-slate-900">
              Workplace Safety Incident Audit Dossier
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Generated following autonomous computer vision scan of industrial sector imagery.
            </p>
          </div>

          {/* Incident Core Metadata Table */}
          <table className="w-full text-xs border-collapse border border-slate-300 mb-6">
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="bg-slate-50 p-2.5 font-semibold text-slate-700 w-1/3 border-r border-slate-200">
                  Incident Classification
                </td>
                <td className="p-2.5 font-mono font-bold capitalize text-slate-900">
                  {activeIncident.type.replace(/_/g, ' ')}
                </td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="bg-slate-50 p-2.5 font-semibold text-slate-700 border-r border-slate-200">
                  Assigned Risk Severity
                </td>
                <td className="p-2.5 font-bold uppercase">
                  {activeIncident.severity}
                </td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="bg-slate-50 p-2.5 font-semibold text-slate-700 border-r border-slate-200">
                  Vision Model Confidence Rating
                </td>
                <td className="p-2.5 font-mono">
                  {Math.round((activeIncident.confidence || 0) * 100)}% Match
                </td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="bg-slate-50 p-2.5 font-semibold text-slate-700 border-r border-slate-200">
                  Observed Physical Location
                </td>
                <td className="p-2.5">
                  {activeIncident.location || 'Visual field sector'}
                </td>
              </tr>
              <tr className="border-b border-slate-200">
                <td className="bg-slate-50 p-2.5 font-semibold text-slate-700 border-r border-slate-200">
                  Associated Analysis Batch
                </td>
                <td className="p-2.5 font-mono text-[11px]">
                  #{activeIncident.analysis_id} ({activeIncident.file_name})
                </td>
              </tr>
              <tr>
                <td className="bg-slate-50 p-2.5 font-semibold text-slate-700 border-r border-slate-200">
                  Ingestion Timestamp
                </td>
                <td className="p-2.5 font-mono text-[11px]">
                  {new Date(activeIncident.created_at).toISOString()}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Findings Description Section */}
          <div className="space-y-4 mb-6">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1 border-b border-slate-200 pb-1">
                Visual Finding Narrative
              </h3>
              <p className="text-xs text-slate-800 leading-relaxed font-sans bg-slate-50 p-3 border border-slate-200 rounded-xs">
                {activeIncident.description}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1 border-b border-slate-200 pb-1">
                Mandatory Safety Officer Directives
              </h3>
              <p className="text-xs text-slate-800 leading-relaxed bg-slate-50 p-3 border border-slate-200 rounded-xs">
                {activeIncident.recommended_action}
              </p>
            </div>

            {activeIncident.resolution_notes && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1 border-b border-slate-200 pb-1">
                  Corrective Action Record &amp; Resolution Log
                </h3>
                <p className="text-xs text-slate-800 leading-relaxed bg-slate-50 p-3 border border-slate-200 rounded-xs">
                  {activeIncident.resolution_notes}
                </p>
              </div>
            )}
          </div>

          {/* Regulatory Advisory Footnote */}
          <div className="p-3 bg-slate-100 border border-slate-200 rounded-xs text-[10px] text-slate-600 mb-8 leading-relaxed">
            <strong>ADVISORY DISCLAIMER:</strong> AI-generated safety findings are decision-support recommendations and should be verified by qualified personnel. VisionGuard AI provides optical intelligence assistance and does not replace statutory OSHA inspections or designated safety supervisor audits.
          </div>

          {/* Formal Sign-off Section */}
          <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-300 text-xs">
            <div>
              <div className="text-[11px] font-semibold text-slate-700">Safety Officer Sign-off</div>
              <div className="h-12 border-b border-slate-400 mt-2"></div>
              <div className="text-[10px] text-slate-500 mt-1">Signature / Date / Badge Number</div>
            </div>
            <div>
              <div className="text-[11px] font-semibold text-slate-700">Operations Manager Concurrence</div>
              <div className="h-12 border-b border-slate-400 mt-2"></div>
              <div className="text-[10px] text-slate-500 mt-1">Signature / Date / Division</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
