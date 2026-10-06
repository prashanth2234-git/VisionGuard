const express = require('express');
const router = express.Router();
const incidentController = require('../controllers/incidentController');
const { authenticate } = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validateMiddleware');
const { updateIncidentStatusSchema } = require('../validators/incidentSchemas');

// List incidents with filters
router.get('/', authenticate, incidentController.getIncidents);

// Retrieve single incident details
router.get('/:id', authenticate, incidentController.getIncidentById);

// Update incident status (e.g. open -> acknowledged -> resolved)
router.patch('/:id/status', authenticate, validateBody(updateIncidentStatusSchema), incidentController.updateIncidentStatus);

module.exports = router;
