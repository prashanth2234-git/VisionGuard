const db = require('../db');
const { AppError } = require('../utils/errors');
const logger = require('../utils/logger');

const getIncidents = async ({ status, severity, type, limit = 50, offset = 0 } = {}) => {
  let queryText = `
    SELECT i.id, i.analysis_id, i.type, i.severity, i.confidence, i.description,
           i.location, i.recommended_action, i.status, i.created_at, i.resolved_at,
           i.resolution_notes,
           a.file_name, a.file_path, a.media_type, a.scene_summary
    FROM incidents i
    JOIN analyses a ON i.analysis_id = a.id
    WHERE 1=1
  `;
  const params = [];

  if (status) {
    params.push(status);
    queryText += ` AND i.status = $${params.length}`;
  }

  if (severity) {
    params.push(severity);
    queryText += ` AND i.severity = $${params.length}`;
  }

  if (type) {
    params.push(type);
    queryText += ` AND i.type = $${params.length}`;
  }

  queryText += ` ORDER BY i.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(limit, offset);

  const result = await db.query(queryText, params);

  // Total count for current filter
  let countQuery = 'SELECT COUNT(*) AS total FROM incidents i WHERE 1=1';
  const countParams = [];
  if (status) {
    countParams.push(status);
    countQuery += ` AND i.status = $${countParams.length}`;
  }
  if (severity) {
    countParams.push(severity);
    countQuery += ` AND i.severity = $${countParams.length}`;
  }
  if (type) {
    countParams.push(type);
    countQuery += ` AND i.type = $${countParams.length}`;
  }
  const totalRes = await db.query(countQuery, countParams);
  const total = parseInt(totalRes.rows[0]?.total || '0', 10);

  return {
    incidents: result.rows,
    total,
    limit,
    offset,
  };
};

const getIncidentById = async (id) => {
  const result = await db.query(
    `SELECT i.id, i.analysis_id, i.type, i.severity, i.confidence, i.description,
            i.location, i.recommended_action, i.status, i.created_at, i.resolved_at,
            i.resolution_notes,
            a.file_name, a.file_path, a.media_type, a.scene_summary, a.overall_risk,
            a.created_at AS analysis_created_at
     FROM incidents i
     JOIN analyses a ON i.analysis_id = a.id
     WHERE i.id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new AppError('Incident not found.', 404, 'INCIDENT_NOT_FOUND');
  }

  const incident = result.rows[0];

  // Also fetch timeline events for this analysis
  const eventsResult = await db.query(
    `SELECT id, event_time, event_type, description, severity, created_at
     FROM analysis_events
     WHERE analysis_id = $1
     ORDER BY created_at ASC`,
    [incident.analysis_id]
  );

  return {
    ...incident,
    timeline_events: eventsResult.rows,
  };
};

const updateIncidentStatus = async (id, { status, resolution_notes }) => {
  const existing = await db.query('SELECT id, status FROM incidents WHERE id = $1', [id]);
  if (existing.rows.length === 0) {
    throw new AppError('Incident not found.', 404, 'INCIDENT_NOT_FOUND');
  }

  const isResolving = status === 'resolved';
  const resolvedAt = isResolving ? new Date().toISOString() : null;

  await db.query(
    `UPDATE incidents
     SET status = $1,
         resolved_at = $2,
         resolution_notes = COALESCE($3, resolution_notes)
     WHERE id = $4`,
    [status, resolvedAt, resolution_notes || null, id]
  );

  logger.info(`Updated incident ${id} status to ${status}`);

  return getIncidentById(id);
};

module.exports = {
  getIncidents,
  getIncidentById,
  updateIncidentStatus,
};
