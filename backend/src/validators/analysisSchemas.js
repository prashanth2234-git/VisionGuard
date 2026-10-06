const { z } = require('zod');

const violationSchema = z.object({
  type: z.string().default('general_safety_anomaly'),
  severity: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
  confidence: z.number().min(0).max(1).default(0.85),
  description: z.string().default('Unspecified visual finding'),
  location: z.string().default('Workplace area'),
  recommended_action: z.string().default('Perform safety verification'),
});

const incidentItemSchema = z.object({
  type: z.string().default('general_safety_anomaly'),
  severity: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
  confidence: z.number().min(0).max(1).default(0.85),
  description: z.string().default('Detected visual safety incident'),
  location: z.string().default('Workplace area'),
  recommended_action: z.string().default('Inspect zone and instruct personnel'),
});

const timelineEventSchema = z.object({
  event_time: z.string().default('Frame analysis'),
  event_type: z.string().default('Detection'),
  description: z.string().default('Visual event detected'),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'info']).default('info'),
});

const geminiVisionResponseSchema = z.object({
  scene_summary: z.string().default('Workplace visual scan completed.'),
  persons_detected: z.number().int().min(0).default(0),
  violations: z.array(violationSchema).default([]),
  incidents: z.array(incidentItemSchema).default([]),
  overall_risk: z.enum(['critical', 'high', 'medium', 'low', 'none']).default('low'),
  recommended_actions: z.array(z.string()).default([]),
  timeline_events: z.array(timelineEventSchema).default([]),
});

module.exports = {
  geminiVisionResponseSchema,
  violationSchema,
  incidentItemSchema,
};
