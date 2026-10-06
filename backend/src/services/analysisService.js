const { v4: uuidv4 } = require('uuid');
const path = require('path');
const db = require('../db');
const geminiService = require('./geminiService');
const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');

const createAnalysis = async ({ file, userId, engine = 'gemini' }) => {
  if (!file) {
    throw new AppError('No media file uploaded for analysis.', 400, 'NO_FILE_UPLOADED');
  }

  const analysisId = uuidv4();
  const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';
  const relativeFilePath = `/uploads/${path.basename(file.path)}`;

  // Deterministic Analysis Display ID: ANL-2026-00001
  const countRes = await db.query('SELECT COUNT(*) AS total FROM analyses');
  const totalAnalyses = parseInt(countRes.rows[0]?.total || '0', 10);
  const displayId = `ANL-2026-${String(totalAnalyses + 1).padStart(5, '0')}`;

  logger.info(`Starting visual safety analysis for ${file.originalname}`, {
    analysisId,
    displayId,
    engine,
    mediaType,
    size: file.size,
    mimeType: file.mimetype,
  });

  // Call Vision AI Service
  const aiResult = await geminiService.analyzeMedia(
    file.path,
    file.mimetype,
    file.originalname,
    engine
  );

  const engineName = aiResult.analysis_engine || (engine === 'demo_baseline' ? 'Demo Baseline' : 'Gemini Vision');
  const whyFlaggedStr = JSON.stringify(aiResult.why_flagged || []);
  const riskAssessment = aiResult.risk_assessment || 'Visual findings recorded by optical intelligence.';

  // Store in analyses table
  await db.query(
    `INSERT INTO analyses (
      id, display_id, user_id, media_type, file_name, file_path, file_size, mime_type,
      scene_summary, persons_detected, overall_risk, analysis_engine,
      why_flagged, risk_assessment, raw_ai_response
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
    [
      analysisId,
      displayId,
      userId || null,
      mediaType,
      file.originalname,
      relativeFilePath,
      file.size,
      file.mimetype,
      aiResult.scene_summary,
      aiResult.persons_detected || 0,
      aiResult.overall_risk || 'low',
      engineName,
      whyFlaggedStr,
      riskAssessment,
      JSON.stringify(aiResult),
    ]
  );

  // Count incidents for deterministic sequential incident display IDs: INC-2026-00001
  const incidentCountRes = await db.query('SELECT COUNT(*) AS total FROM incidents');
  let currentIncidentSeq = parseInt(incidentCountRes.rows[0]?.total || '0', 10);

  // Create linked Incidents with full visual evidence
  const createdIncidents = [];
  const findingsToProcess = Array.isArray(aiResult.findings) && aiResult.findings.length > 0
    ? aiResult.findings
    : (Array.isArray(aiResult.violations) ? aiResult.violations : []);

  for (const item of findingsToProcess) {
    currentIncidentSeq += 1;
    const incidentId = uuidv4();
    const incidentDisplayId = `INC-2026-${String(currentIncidentSeq).padStart(5, '0')}`;
    const confidence = typeof item.confidence === 'number' ? Math.min(Math.max(item.confidence, 0), 1) : 0.85;

    await db.query(
      `INSERT INTO incidents (
        id, display_id, analysis_id, type, severity, confidence, description,
        visual_evidence, explanation, location, recommended_action, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'open')`,
      [
        incidentId,
        incidentDisplayId,
        analysisId,
        item.type || 'general_safety_anomaly',
        item.severity || 'medium',
        confidence,
        item.description || item.visual_evidence || 'Visual safety anomaly detected',
        item.visual_evidence || item.description || 'Observed in active sector',
        item.explanation || 'Protocol non-compliance in monitored workspace',
        item.location || 'Observed sector',
        item.recommended_action || 'Inspect sector and verify safety protocol',
      ]
    );

    createdIncidents.push({
      id: incidentId,
      display_id: incidentDisplayId,
      analysis_id: analysisId,
      type: item.type || 'general_safety_anomaly',
      severity: item.severity || 'medium',
      confidence,
      description: item.description || item.visual_evidence,
      visual_evidence: item.visual_evidence || item.description,
      explanation: item.explanation || 'Protocol non-compliance in monitored workspace',
      location: item.location,
      recommended_action: item.recommended_action,
      status: 'open',
    });
  }

  // Create timeline events
  const timelineEvents = [];
  if (Array.isArray(aiResult.timeline_events) && aiResult.timeline_events.length > 0) {
    for (const ev of aiResult.timeline_events) {
      const eventId = uuidv4();
      await db.query(
        `INSERT INTO analysis_events (
          id, analysis_id, event_time, event_type, description, severity
        ) VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          eventId,
          analysisId,
          ev.event_time || '00:00',
          ev.event_type || 'Event',
          ev.description || 'Observed activity',
          ev.severity || 'info',
        ]
      );
      timelineEvents.push({
        id: eventId,
        analysis_id: analysisId,
        event_time: ev.event_time,
        event_type: ev.event_type,
        description: ev.description,
        severity: ev.severity,
      });
    }
  } else {
    const eventId = uuidv4();
    await db.query(
      `INSERT INTO analysis_events (
        id, analysis_id, event_time, event_type, description, severity
      ) VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        eventId,
        analysisId,
        '00:00',
        'Visual Ingestion',
        `Analyzed ${file.originalname}. Detected ${aiResult.persons_detected} person(s). Overall risk: ${aiResult.overall_risk}.`,
        aiResult.overall_risk === 'critical' ? 'critical' : 'info',
      ]
    );
    timelineEvents.push({
      id: eventId,
      analysis_id: analysisId,
      event_time: '00:00',
      event_type: 'Visual Ingestion',
      description: `Analyzed ${file.originalname}. Detected ${aiResult.persons_detected} person(s). Overall risk: ${aiResult.overall_risk}.`,
      severity: aiResult.overall_risk === 'critical' ? 'critical' : 'info',
    });
  }

  return {
    id: analysisId,
    display_id: displayId,
    file_name: file.originalname,
    file_path: relativeFilePath,
    media_type: mediaType,
    scene_summary: aiResult.scene_summary,
    persons_detected: aiResult.persons_detected || 0,
    overall_risk: aiResult.overall_risk || 'low',
    analysis_engine: engineName,
    why_flagged: aiResult.why_flagged || [],
    risk_assessment: riskAssessment,
    recommended_actions: aiResult.recommended_actions || [],
    findings: createdIncidents,
    incidents: createdIncidents,
    timeline_events: timelineEvents,
    created_at: new Date().toISOString(),
  };
};

const getAnalyses = async ({ limit = 20, offset = 0 }) => {
  const result = await db.query(
    `SELECT a.id, a.display_id, a.user_id, a.media_type, a.file_name, a.file_path, a.file_size,
            a.scene_summary, a.persons_detected, a.overall_risk, a.analysis_engine, a.created_at,
            COUNT(i.id) AS incident_count
     FROM analyses a
     LEFT JOIN incidents i ON a.id = i.analysis_id
     GROUP BY a.id
     ORDER BY a.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  const totalResult = await db.query('SELECT COUNT(*) AS total FROM analyses');
  const total = parseInt(totalResult.rows[0]?.total || '0', 10);

  return {
    analyses: result.rows,
    total,
    limit,
    offset,
  };
};

const getAnalysisById = async (id) => {
  const analysisResult = await db.query(
    `SELECT id, display_id, user_id, media_type, file_name, file_path, file_size, mime_type,
            scene_summary, persons_detected, overall_risk, analysis_engine,
            why_flagged, risk_assessment, raw_ai_response, created_at
     FROM analyses WHERE id = $1 OR display_id = $1`,
    [id]
  );

  if (analysisResult.rows.length === 0) {
    throw new AppError('Analysis record not found.', 404, 'ANALYSIS_NOT_FOUND');
  }

  const analysis = analysisResult.rows[0];

  const incidentsResult = await db.query(
    `SELECT id, display_id, type, severity, confidence, description,
            visual_evidence, explanation, location,
            recommended_action, status, created_at, resolved_at, resolution_notes
     FROM incidents
     WHERE analysis_id = $1
     ORDER BY created_at ASC`,
    [analysis.id]
  );

  const eventsResult = await db.query(
    `SELECT id, event_time, event_type, description, severity, created_at
     FROM analysis_events
     WHERE analysis_id = $1
     ORDER BY created_at ASC`,
    [analysis.id]
  );

  let parsedWhyFlagged = [];
  try {
    parsedWhyFlagged = JSON.parse(analysis.why_flagged || '[]');
  } catch {
    parsedWhyFlagged = [];
  }

  let rawData = {};
  try {
    rawData = JSON.parse(analysis.raw_ai_response || '{}');
  } catch {
    rawData = {};
  }

  return {
    ...analysis,
    why_flagged: parsedWhyFlagged.length > 0 ? parsedWhyFlagged : (rawData.why_flagged || []),
    risk_assessment: analysis.risk_assessment || rawData.risk_assessment || 'Visual findings logged by optical model.',
    recommended_actions: rawData.recommended_actions || [],
    findings: incidentsResult.rows,
    incidents: incidentsResult.rows,
    timeline_events: eventsResult.rows,
  };
};

module.exports = {
  createAnalysis,
  getAnalyses,
  getAnalysisById,
};
