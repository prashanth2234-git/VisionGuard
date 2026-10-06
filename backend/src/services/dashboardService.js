const db = require('../db');

const getDashboardStats = async () => {
  // Query total analyses
  const analysesCountRes = await db.query('SELECT COUNT(*) AS total FROM analyses');
  const totalAnalyses = parseInt(analysesCountRes.rows[0]?.total || '0', 10);

  // Query incident counts by status
  const openIncidentsRes = await db.query("SELECT COUNT(*) AS total FROM incidents WHERE status = 'open'");
  const openIncidents = parseInt(openIncidentsRes.rows[0]?.total || '0', 10);

  const criticalIncidentsRes = await db.query("SELECT COUNT(*) AS total FROM incidents WHERE severity = 'critical'");
  const criticalIncidents = parseInt(criticalIncidentsRes.rows[0]?.total || '0', 10);

  const resolvedIncidentsRes = await db.query("SELECT COUNT(*) AS total FROM incidents WHERE status = 'resolved'");
  const resolvedIncidents = parseInt(resolvedIncidentsRes.rows[0]?.total || '0', 10);

  const totalIncidentsRes = await db.query('SELECT COUNT(*) AS total FROM incidents');
  const totalIncidents = parseInt(totalIncidentsRes.rows[0]?.total || '0', 10);

  // Risk distribution (grouped by severity)
  const severityRes = await db.query(`
    SELECT severity, COUNT(*) AS count
    FROM incidents
    GROUP BY severity
  `);
  const riskDistribution = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };
  severityRes.rows.forEach((row) => {
    if (riskDistribution[row.severity] !== undefined) {
      riskDistribution[row.severity] = parseInt(row.count, 10);
    }
  });

  // Incident types breakdown
  const typesRes = await db.query(`
    SELECT type, COUNT(*) AS count
    FROM incidents
    GROUP BY type
    ORDER BY count DESC
  `);
  const incidentTypes = typesRes.rows.map((row) => ({
    type: row.type,
    count: parseInt(row.count, 10),
  }));

  // Recent 5 incidents
  const recentIncidentsRes = await db.query(`
    SELECT i.id, i.analysis_id, i.type, i.severity, i.confidence, i.description,
           i.location, i.status, i.created_at,
           a.file_name, a.media_type
    FROM incidents i
    JOIN analyses a ON i.analysis_id = a.id
    ORDER BY i.created_at DESC
    LIMIT 5
  `);

  // Recent 5 analyses
  const recentAnalysesRes = await db.query(`
    SELECT a.id, a.file_name, a.media_type, a.scene_summary, a.overall_risk,
           a.persons_detected, a.created_at,
           COUNT(i.id) AS incident_count
    FROM analyses a
    LEFT JOIN incidents i ON a.id = i.analysis_id
    GROUP BY a.id
    ORDER BY a.created_at DESC
    LIMIT 5
  `);

  return {
    overview: {
      total_analyses: totalAnalyses,
      total_incidents: totalIncidents,
      open_incidents: openIncidents,
      critical_incidents: criticalIncidents,
      resolved_incidents: resolvedIncidents,
    },
    risk_distribution: riskDistribution,
    incident_types: incidentTypes,
    recent_incidents: recentIncidentsRes.rows,
    recent_analyses: recentAnalysesRes.rows,
  };
};

module.exports = {
  getDashboardStats,
};
