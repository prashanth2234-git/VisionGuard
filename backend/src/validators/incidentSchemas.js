const { z } = require('zod');

const updateIncidentStatusSchema = z.object({
  status: z.enum(['open', 'acknowledged', 'resolved'], {
    errorMap: () => ({ message: 'Status must be one of: open, acknowledged, resolved' }),
  }),
  resolution_notes: z.string().max(1000).optional(),
});

module.exports = {
  updateIncidentStatusSchema,
};
