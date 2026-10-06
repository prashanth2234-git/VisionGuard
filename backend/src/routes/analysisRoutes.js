const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');
const { authenticate } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Media analysis upload and execution
router.post('/', authenticate, upload.single('media'), analysisController.createAnalysis);

// List all analyses
router.get('/', authenticate, analysisController.getAnalyses);

// Retrieve detailed analysis by ID
router.get('/:id', authenticate, analysisController.getAnalysisById);

module.exports = router;
