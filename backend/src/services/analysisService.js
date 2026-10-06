const { v4: uuidv4 } = require('uuid');
const path = require('path');
const db = require('../db');
const geminiService = require('./geminiService');
const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');

const createAnalysis = async ({ file, userId }) => {
  if (!file) {
    throw new AppError('No media file uploaded for analysis.', 400, 'NO_FILE_UPLOADED');
  }

  const analysisId = uuidv4();
  const mediaType = file.mimetype.startsWith('video/') ? 'video' : 'image';
  const relativeFilePath = `/uploads/${path.basename(file.path)}`;

  logger.info(`Starting visual safety analysis for ${file.originalname}`, {
    analysisId,
    mediaType,
    size: file.size,
    mimeType: file.mimetype,
  });

  // Call Gemini Vision AI Service
  const aiResult = await geminiService.analyzeMedia(file.path, file.mimetype, file.originalname);

  // Store in analyses table
  await db.query(
    `INSERT INTO analyses (
      id, user_id, media_type, file_name, file_path, file_size, mime_type,
      scene_summary, persons_detected, overall_risk, raw_ai_response
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
    [
      analysisId,
      userId || null,
      mediaType,
      file.originalname,
      relativeFilePath,
      file.size,
      file.mimetype,
      aiResult.scene_summary,
      aiResult.persons_detected || 0,
      aiResult.overall_risk || 'low',
      JSON.stringify(aiResult),
    ]
  );

  // Create linked Incidents
  const createdIncidents = [];
  const incidentsToProcess = aiResult.incidents && aiResult.incidents.length > 0
    ? aiResult.incidents
    : (aiResult.violations || []);

  for (const item of incidentsToProcess) {
    const incidentId = uuidv4();
    const confidence = typeof item.confidence === 'number' ? Math.min(Math.max(item.confidence, 0), 1) : 0.85;

    await db.query(
      `INSERT INTO incidents (
        id, analysis_id, type, severity, confidence, description,
        location, recommended_action, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'open')`,
      [
        incidentId,
        analysisId,
        item.type || 'general_safety_anomaly',
        item.severity || 'medium',
        confidence,
        item.description || 'Visual safety anomaly detected',
        item.location || 'Observed sector',
        item.recommended_action || 'Inspect sector and verify safety protocol',
      ]
    );

    createdIncidents.push({
      id: incidentId,
      analysis_id: analysisId,
      type: item.type || 'general_safety_anomaly',
      severity: item.severity || 'medium',
      confidence,
      description: item.description,
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
    // If no specific timeline events, generate initial audit log event
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
    file_name: file.originalname,
    file_path: relativeFilePath,
    media_type: mediaType,
    scene_summary: aiResult.scene_summary,
    persons_detected: aiResult.persons_detected,
    overall_risk: aiResult.overall_risk,
    recommended_actions: aiResult.recommended_actions || [],
    incidents: createdIncidents,
    timeline_events: timelineEvents,
    created_at: new Date().toISOString(),
  };
};

const getAnalyses = async ({ limit = 20, offset = 0 }) => {
  const result = await db.query(
    `SELECT a.id, a.user_id, a.media_type, a.file_name, a.file_path, a.file_size,
            a.scene_summary, a.persons_detected, a.overall_risk, a.created_at,
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
    `SELECT id, user_id, media_type, file_name, file_path, file_size, mime_type,
            scene_summary, persons_detected, overall_risk, raw_ai_response, created_at
     FROM analyses WHERE id = $1`,
    [id]
  );

  if (analysisResult.rows.length === 0) {
    throw new AppError('Analysis record not found.', 404, 'ANALYSIS_NOT_FOUND');
  }

  const analysis = analysisResult.rows[0];

  const incidentsResult = await db.query(
    `SELECT id, type, severity, confidence, description, location,
            recommended_action, status, created_at, resolved_at, resolution_notes
     FROM incidents
     WHERE analysis_id = $1
     ORDER BY created_at ASC`,
    [id]
  );

  const eventsResult = await db.query(
    `SELECT id, event_time, event_type, description, severity, created_at
     FROM analysis_events
     WHERE analysis_id = $1
     ORDER BY created_at ASC`,
    [id]
  );

  let rawData = {};
  try {
    rawData = JSON.parse(analysis.raw_ai_response || '{}');
  } catch {
    rawData = {};
  }

  return {
    ...analysis,
    recommended_actions: rawData.recommended_actions || [],
    incidents: incidentsResult.rows,
    timeline_events: eventsResult.rows,
  };
};

module.exports = {
  createAnalysis,
  getAnalyses,
  getAnalysisById,
};
