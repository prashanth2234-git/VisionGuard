const dashboardService = require('../services/dashboardService');
const { successResponse } = require('../utils/response');

const getStats = async (req, res, next) => {
  try {
    const stats = await dashboardService.getDashboardStats();
    return successResponse(res, stats, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getStats,
};
