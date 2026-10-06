const { z } = require('zod');

const findingItemSchema = z.object({
  type: z.string().default('general_safety_anomaly'),
  severity: z.enum(['critical', 'high', 'medium', 'low']).default('medium'),
  confidence: z.number().min(0).max(1).default(0.85),
  visual_evidence: z.string().default('Visual anomaly observed in monitored work sector.'),
  location: z.string().default('Monitored sector'),
  explanation: z.string().default('Non-compliance with established industrial safety protocols.'),
  recommended_action: z.string().default('Inspect sector and verify compliance protocol.'),
});

const timelineEventSchema = z.object({
  event_time: z.string().default('00:01'),
  event_type: z.string().default('Detection'),
  description: z.string().default('Visual event detected'),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'info']).default('info'),
});

const geminiVisionResponseSchema = z.object({
  scene_summary: z.string().default('Workplace visual scan completed.'),
  persons_detected: z.number().int().min(0).default(0),
  findings: z.array(findingItemSchema).default([]),
  overall_risk: z.enum(['critical', 'high', 'medium', 'low', 'none']).default('low'),
  why_flagged: z.array(z.string()).default([]),
  risk_assessment: z.string().default('Routine optical review conducted.'),
  recommended_actions: z.array(z.string()).default([]),
  timeline_events: z.array(timelineEventSchema).default([]),
});

module.exports = {
  geminiVisionResponseSchema,
  findingItemSchema,
};
