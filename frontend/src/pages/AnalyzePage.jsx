import React, { useState, useRef, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, getMediaUrl } from '../services/api';
import { SeverityBadge, StatusBadge } from '../components/StatusBadge';
import {
  Upload,
  FileCheck,
  AlertCircle,
  HardHat,
  Eye,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Cpu,
  Info,
  Clock,
  MapPin,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

export default function AnalyzePage() {
  const fileInputRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const urlAnalysisId = searchParams.get('id');

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [engineMode, setEngineMode] = useState('gemini'); // 'gemini' | 'demo_baseline'
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingStage, setLoadingStage] = useState('');
  const [error, setError] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Synchronize and restore analysis on page refresh or navigation
  useEffect(() => {
    if (urlAnalysisId && !analysisResult) {
      let isMounted = true;
      setAnalyzing(true);
      setLoadingStage('Loading saved inspection record...');
      api.getAnalysisById(urlAnalysisId)
        .then((res) => {
          if (isMounted && res.success && res.data) {
            setAnalysisResult(res.data);
          }
        })
        .catch((err) => {
          if (isMounted) {
            console.error('Failed to restore analysis by ID:', err);
          }
        })
        .finally(() => {
          if (isMounted) {
            setAnalyzing(false);
            setLoadingStage('');
          }
        });
      return () => {
        isMounted = false;
      };
    }
  }, [urlAnalysisId]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFileSelection(file);
  };

  const processFileSelection = (file) => {
    setError(null);
    setAnalysisResult(null);

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/quicktime'];
    if (!validTypes.includes(file.type)) {
      setError(`Unsupported file type (${file.type}). Supported formats are JPEG, PNG, WEBP, MP4, and WEBM.`);
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setError('File size exceeds the 25MB threshold limit.');
      return;
    }

    setSelectedFile(file);
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleLoadSamplePhoto = async (url, filename) => {
    try {
      setError(null);
      setAnalysisResult(null);
      setSearchParams({});
      setEngineMode('gemini');
      const res = await fetch(url);
      const blob = await res.blob();
      const file = new File([blob], filename, { type: 'image/jpeg' });
      processFileSelection(file);
    } catch (e) {
      setError(`Failed to load sample workplace media: ${e.message}`);
    }
  };

  const handlePresetSelect = (presetName, filename, targetEngine = 'demo_baseline') => {
    setError(null);
    setAnalysisResult(null);
    setSearchParams({});
    setEngineMode(targetEngine);

    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 640, 480);

    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < 640; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 480);
      ctx.stroke();
    }
    for (let y = 0; y < 480; y += 40) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(640, y);
      ctx.stroke();
    }

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(24, 24, 340, 84);
    ctx.strokeStyle = '#ea580c';
    ctx.strokeRect(24, 24, 340, 84);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('VISIONGUARD OPTICAL SURVEILLANCE', 40, 56);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px monospace';
    ctx.fillText(`SECTOR FEED: ${presetName.toUpperCase()}`, 40, 80);

    canvas.toBlob((blob) => {
      const file = new File([blob], filename, { type: 'image/png' });
      processFileSelection(file);
    }, 'image/png');
  };

  const handleExecuteAnalysis = async () => {
    if (!selectedFile) return;

    setAnalyzing(true);
    setError(null);

    try {
      setLoadingStage('Uploading media to secure ingestion pipeline...');
      await new Promise((r) => setTimeout(r, 350));

      setLoadingStage(
        engineMode === 'gemini'
          ? 'Executing live Google Gemini Vision model inference...'
          : 'Executing local deterministic safety baseline evaluator...'
      );

      const formData = new FormData();
      formData.append('media', selectedFile);
      formData.append('engine', engineMode);

      const response = await api.uploadMedia(formData);

      setLoadingStage('Validating structured findings and persisting incidents...');
      await new Promise((r) => setTimeout(r, 250));

      if (response?.success && response?.data) {
        setAnalysisResult(response.data);
        if (response.data.id) {
          setSearchParams({ id: response.data.id });
        }
      } else {
        throw new Error(response?.error?.message || 'Visual analysis failed to complete.');
      }
    } catch (err) {
      setError(err.message || 'Vision analysis failed. Check configuration or network connectivity.');
    } finally {
      setAnalyzing(false);
      setLoadingStage('');
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setError(null);
    setSearchParams({});
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Derive summary metrics from actual analysis findings
  const findingsList = analysisResult?.findings || analysisResult?.incidents || [];
  const highRiskCount = findingsList.filter(
    (f) => f.severity === 'critical' || f.severity === 'high'
  ).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header with Engine Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Workplace Visual Inspection
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated visual intelligence detecting PPE violations, worker falls, and site hazards.
          </p>
        </div>

        {/* Engine Mode Toggle */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded border border-slate-200 self-start sm:self-auto">
          <span className="text-[11px] font-mono text-slate-500 px-2 uppercase font-medium">Engine:</span>
          <button
            type="button"
            onClick={() => setEngineMode('gemini')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              engineMode === 'gemini'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-orange-500" />
            <span>Gemini Vision</span>
          </button>
          <button
            type="button"
            onClick={() => setEngineMode('demo_baseline')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              engineMode === 'demo_baseline'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Demo Baseline</span>
          </button>
        </div>
      </div>

      {/* Error alert with troubleshooting action */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-900 text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">Inspection Failed</p>
            <p>{error}</p>
            {error.includes('GEMINI') || error.includes('Gemini Vision requires') ? (
              <p className="text-[11px] text-red-700 pt-1">
                Note: To test without external API credentials, toggle the engine selector to <strong>Demo Baseline</strong> above or configure your Gemini Vision API credentials in the backend environment.
              </p>
            ) : null}
          </div>
        </div>
      )}

      {/* Ingestion & Preset Selector (Shown when no active analysis result) */}
      {!analysisResult && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Upload Box */}
          <div className="lg:col-span-2 space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded p-8 text-center cursor-pointer transition-colors ${
                selectedFile
                  ? 'border-orange-500 bg-orange-50/20'
                  : 'border-slate-300 hover:border-slate-400 bg-white'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                onChange={handleFileChange}
              />

              <div className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center mx-auto text-slate-600 mb-3">
                <Upload className="w-6 h-6" />
              </div>

              {selectedFile ? (
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-slate-100 border border-slate-200 text-xs font-mono text-slate-800">
                    <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{selectedFile.name}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB | Click to select another file
                  </p>
                  {previewUrl && (
                    <div className="mt-4 max-w-sm mx-auto overflow-hidden rounded border border-slate-200 bg-slate-900">
                      <img src={previewUrl} alt="Inspection preview" className="w-full h-auto max-h-48 object-contain" />
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Select workplace media or drag and drop file
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Supports high-resolution images (JPEG, PNG, WEBP) and video files (MP4, WEBM). Max 25MB.
                  </p>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 font-mono">
                Active Engine: <strong className="text-slate-800 uppercase">{engineMode === 'gemini' ? 'Gemini Vision (Live)' : 'Demo Baseline'}</strong>
              </span>
              <div className="flex gap-2">
                {selectedFile && (
                  <button
                    type="button"
                    onClick={handleReset}
                    disabled={analyzing}
                    className="px-3 py-1.5 text-xs text-slate-700 bg-white border border-slate-300 rounded hover:bg-slate-50"
                  >
                    Reset
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleExecuteAnalysis}
                  disabled={!selectedFile || analyzing}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-orange-600 hover:bg-orange-700 disabled:bg-slate-300 disabled:text-slate-500 rounded transition-colors shadow-xs"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>{loadingStage || 'Processing inspection...'}</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      <span>Run Visual Inspection</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Evaluator Benchmark Presets */}
          <div className="bg-white border border-slate-200 rounded p-4 h-fit space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2">
              <HardHat className="w-4 h-4 text-orange-600" />
              <span>Benchmark Test Presets</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Quickly load standard visual scenarios to evaluate detection accuracy and evidence extraction:
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleLoadSamplePhoto('/samples/construction_ppe_hazard.jpg', 'construction_ppe_hazard.jpg')}
                disabled={analyzing}
                className="w-full text-left p-2.5 rounded bg-orange-50 hover:bg-orange-100/80 border border-orange-200 transition-colors text-xs"
              >
                <div className="font-semibold text-slate-900 flex items-center justify-between">
                  <span>Live Photo: Steel Erection PPE Violation</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-orange-600 text-white font-bold">GEMINI</span>
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">High-res workplace photo with real personnel without helmet/vest</div>
              </button>

              <button
                type="button"
                onClick={() => handlePresetSelect('Scaffold PPE Compliance', 'sample_ppe_violation.png', 'demo_baseline')}
                disabled={analyzing}
                className="w-full text-left p-2.5 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors text-xs"
              >
                <div className="font-semibold text-slate-900">Preset A: Missing Hard Hat &amp; Vest</div>
                <div className="text-[11px] text-slate-500">Fabrication scaffold bay PPE non-compliance</div>
              </button>

              <button
                type="button"
                onClick={() => handlePresetSelect('Walkway Slip and Fall', 'sample_worker_fall.png', 'demo_baseline')}
                disabled={analyzing}
                className="w-full text-left p-2.5 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors text-xs"
              >
                <div className="font-semibold text-slate-900">Preset B: Worker Fall Anomaly</div>
                <div className="text-[11px] text-slate-500">Recumbent posture detection on main transit corridor</div>
              </button>

              <button
                type="button"
                onClick={() => handlePresetSelect('Exhaust Particulate Plume', 'sample_smoke_hazard.png', 'demo_baseline')}
                disabled={analyzing}
                className="w-full text-left p-2.5 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors text-xs"
              >
                <div className="font-semibold text-slate-900">Preset C: Smoke &amp; Thermal Hazard</div>
                <div className="text-[11px] text-slate-500">Dense airborne vapor signature near machinery housing</div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analysis In-Flight Modal */}
      {analyzing && (
        <div className="bg-white border border-slate-200 rounded p-8 text-center my-6">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-900">{loadingStage}</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Extracting visual evidence, evaluating safety protocols, and creating persistent incident records.
          </p>
        </div>
      )}

      {/* ============================================================ */}
      {/* PROFESSIONAL SPLIT-SCREEN ANALYSIS RESULTS LAYOUT            */}
      {/* ============================================================ */}
      {analysisResult && (
        <div className="space-y-6">
          {/* Top Operational Status Banner */}
          <div className="p-3 bg-white border border-slate-200 rounded flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <div>
                <span className="font-mono text-xs font-bold text-slate-900">
                  {analysisResult.display_id}
                </span>
                <span className="text-xs text-slate-600 ml-2">
                  Analysis completed with {findingsList.length} finding(s) detected.
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-3 py-1.5 text-xs font-medium bg-white text-slate-700 border border-slate-300 rounded hover:bg-slate-50"
              >
                New Inspection
              </button>
              <Link
                to={`/reports?analysisId=${analysisResult.id}`}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-900 text-white rounded hover:bg-slate-800"
              >
                Generate Audit Report
              </Link>
            </div>
          </div>

          {/* Priority 3: Split-Screen Core Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* LEFT: SOURCE MEDIA VISUAL CENTER */}
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded p-4">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-700 border-b border-slate-100 pb-2 mb-3">
                  <span>Source Workplace Media</span>
                  <span className="font-mono text-[10px] text-slate-500 uppercase">
                    {analysisResult.media_type}
                  </span>
                </div>

                {/* Media frame */}
                <div className="rounded border border-slate-300 overflow-hidden bg-slate-950 flex items-center justify-center min-h-[340px]">
                  {analysisResult.media_type === 'video' ? (
                    <video
                      src={getMediaUrl(analysisResult.file_path) || previewUrl}
                      controls
                      className="w-full max-h-[460px] object-contain"
                    />
                  ) : (
                    <img
                      src={getMediaUrl(analysisResult.file_path) || previewUrl}
                      alt={analysisResult.file_name}
                      className="w-full h-auto max-h-[460px] object-contain"
                      onError={(e) => {
                        if (previewUrl && e.currentTarget.src !== previewUrl) {
                          e.currentTarget.src = previewUrl;
                        }
                      }}
                    />
                  )}
                </div>

                {/* Priority 5: Source Metadata Panel */}
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-[11px] font-mono uppercase text-slate-400 block">Analysis ID</span>
                    <span className="font-mono font-bold text-slate-900 mt-0.5 block">{analysisResult.display_id}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono uppercase text-slate-400 block">File Name</span>
                    <span className="font-medium text-slate-900 truncate mt-0.5 block" title={analysisResult.file_name}>
                      {analysisResult.file_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono uppercase text-slate-400 block">Analysis Engine</span>
                    <span className={`inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                      analysisResult.analysis_engine === 'Gemini Vision'
                        ? 'bg-orange-50 text-orange-800 border border-orange-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {analysisResult.analysis_engine || 'Gemini Vision'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono uppercase text-slate-400 block">Timestamp</span>
                    <span className="font-mono text-slate-600 text-[11px] mt-0.5 block">
                      {new Date(analysisResult.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono uppercase text-slate-400 block">Media Format</span>
                    <span className="font-mono text-slate-700 uppercase mt-0.5 block">
                      {analysisResult.media_type}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono uppercase text-slate-400 block">Reference Framework</span>
                    <span className="font-medium text-slate-700 mt-0.5 block">Industrial Safety</span>
                  </div>
                </div>
              </div>

              {/* Scene Context Brief */}
              <div className="bg-white border border-slate-200 rounded p-4">
                <span className="text-[11px] font-mono uppercase text-slate-500 font-bold block mb-1">
                  Scene Summary Narrative
                </span>
                <p className="text-xs text-slate-700 leading-relaxed font-sans bg-slate-50 p-3 rounded border border-slate-200">
                  {analysisResult.scene_summary}
                </p>
              </div>
            </div>

            {/* RIGHT: ANALYSIS FINDINGS & EVIDENCE CARDS */}
            <div className="space-y-4">
              {/* Priority 4: Professional Analysis Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-white border border-slate-200 rounded p-3">
                <div className="p-2.5 rounded bg-slate-50 border border-slate-100 text-center">
                  <span className="text-[10px] font-mono uppercase text-slate-500 block">People Detected</span>
                  <span className="text-lg font-bold font-mono text-slate-900 mt-0.5 block">
                    {analysisResult.persons_detected}
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
                    <SeverityBadge severity={analysisResult.overall_risk} />
                  </div>
                </div>
              </div>

              {/* Priority 2: Structured Computer Vision Evidence Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Detected Safety Findings ({findingsList.length})
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">Optical Inferences</span>
                </div>

                {findingsList.length === 0 ? (
                  <div className="p-6 bg-white border border-slate-200 rounded text-center text-xs text-slate-500">
                    No safety violations detected in this visual frame. Area meets visual compliance criteria.
                  </div>
                ) : (
                  findingsList.map((item, idx) => (
                    <div
                      key={item.id || idx}
                      className="bg-white border border-slate-200 rounded p-4 space-y-3 hover:border-slate-300 transition-colors shadow-xs"
                    >
                      {/* Detection Type, Severity, Confidence */}
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

                      {/* Visual Evidence Block */}
                      <div className="bg-slate-50 p-2.5 rounded border border-slate-200 space-y-1">
                        <span className="text-[10px] font-mono uppercase font-bold text-slate-500 block">
                          Visual Evidence
                        </span>
                        <p className="text-xs text-slate-800 font-medium leading-relaxed">
                          {item.visual_evidence || item.description}
                        </p>
                      </div>

                      {/* Location & Explanation */}
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

                      {/* Recommended Action */}
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
                            <span>Dossier</span>
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

          {/* Priority 7: Risk Reasoning & Context Section (Below Split-Screen) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white border border-slate-200 rounded p-6">
            {/* WHY THIS WAS FLAGGED */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Why This Was Flagged
                </h4>
              </div>
              {analysisResult.why_flagged && analysisResult.why_flagged.length > 0 ? (
                <ul className="space-y-2 text-xs text-slate-700">
                  {analysisResult.why_flagged.map((reason, rIdx) => (
                    <li key={rIdx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-orange-600 mt-1.5 shrink-0" />
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500">
                  Visual characteristics verified within standard baseline parameters.
                </p>
              )}
            </div>

            {/* RISK ASSESSMENT */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Risk Assessment
                </h4>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded border border-slate-200 font-sans">
                {analysisResult.risk_assessment || 'Routine risk evaluation conducted. Non-compliance elevates likelihood of incident occurrence.'}
              </p>
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Decision-support assessment based on visible factors. Does not assert certainty beyond optical observations.</span>
              </div>
            </div>
          </div>

          {/* Generated Incidents Roster */}
          {analysisResult.incidents && analysisResult.incidents.length > 0 && (
            <div className="bg-white border border-slate-200 rounded p-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Committed Incident Registry ({analysisResult.incidents.length})
                </h4>
                <Link
                  to="/incidents"
                  className="text-xs font-medium text-orange-600 hover:text-orange-700 flex items-center gap-1"
                >
                  <span>View All Incidents</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="divide-y divide-slate-100">
                {analysisResult.incidents.map((inc) => (
                  <div key={inc.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-slate-900">{inc.display_id || inc.id.substring(0, 8)}</span>
                      <SeverityBadge severity={inc.severity} />
                      <span className="font-semibold text-slate-800 capitalize">{inc.type.replace(/_/g, ' ')}</span>
                      <span className="text-slate-500 hidden md:inline truncate max-w-xs">{inc.location}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={inc.status} />
                      <Link
                        to={`/incidents/${inc.id}`}
                        className="font-semibold text-slate-900 hover:text-orange-600"
                      >
                        Investigate &rarr;
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
