const incidentService = require('../services/incidentService');
const { successResponse } = require('../utils/response');

const getIncidents = async (req, res, next) => {
  try {
    const { status, severity, type } = req.query;
    const limit = parseInt(req.query.limit || '50', 10);
    const offset = parseInt(req.query.offset || '0', 10);
    const result = await incidentService.getIncidents({ status, severity, type, limit, offset });
    return successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
};

const getIncidentById = async (req, res, next) => {
  try {
    const result = await incidentService.getIncidentById(req.params.id);
    return successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
};

const updateIncidentStatus = async (req, res, next) => {
  try {
    const { status, resolution_notes } = req.body;
    const result = await incidentService.updateIncidentStatus(req.params.id, {
      status,
      resolution_notes,
    });
    return successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getIncidents,
  getIncidentById,
  updateIncidentStatus,
};
