const analysisService = require('../services/analysisService');
const { successResponse } = require('../utils/response');

const createAnalysis = async (req, res, next) => {
  try {
    const result = await analysisService.createAnalysis({
      file: req.file,
      userId: req.user ? req.user.id : null,
    });
    return successResponse(res, result, 201);
  } catch (error) {
    next(error);
  }
};

const getAnalyses = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit || '20', 10);
    const offset = parseInt(req.query.offset || '0', 10);
    const result = await analysisService.getAnalyses({ limit, offset });
    return successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
};

const getAnalysisById = async (req, res, next) => {
  try {
    const result = await analysisService.getAnalysisById(req.params.id);
    return successResponse(res, result, 200);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAnalysis,
  getAnalyses,
  getAnalysisById,
};
