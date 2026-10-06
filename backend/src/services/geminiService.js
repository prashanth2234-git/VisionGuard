const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config');
const logger = require('../utils/logger');
const { AppError } = require('../utils/errors');
const { geminiVisionResponseSchema } = require('../validators/analysisSchemas');

const SYSTEM_INSTRUCTION = `
You are an industrial safety visual intelligence system for VisionGuard AI.
Analyze the supplied workplace image or video frame.
Identify only visually supportable safety findings.
Do not hallucinate people, objects, events, or violations.
Do not infer information that cannot reasonably be observed.
If the scene is safe and all visible personnel are compliant with safety gear (PPE) and no hazards exist, findings MUST be an empty array [] and overall_risk should be "none" or "low". Do not invent or force violations in compliant environments.

Focus strictly on:
1. Missing safety helmet (PPE non-compliance): Personnel in active zones or around equipment without a hard hat.
2. Missing safety vest (high-visibility PPE non-compliance): Personnel in active zones or around equipment without a high-visibility reflective vest.
3. Restricted-zone violation (unauthorized personnel in marked hazardous machinery perimeters)
4. Possible worker fall (recumbent posture on walkway, slip, or sudden fall anomaly)
5. Smoke/fire-like visual hazard (visible particulate plume, uncontained vapor, or thermal ignition)
6. General visual safety anomaly (unsecured ladder, blocked egress pathway, spill)

Audit each visible worker individually for BOTH head protection (type: "missing_helmet") and torso visibility (type: "missing_vest"). If a worker is missing both, report two separate finding objects. Do not categorize missing vests as general anomalies.

For every detected issue provide:
- type: one of "missing_helmet", "missing_vest", "restricted_zone_violation", "worker_fall", "smoke_fire_hazard", "general_safety_anomaly"
- severity: one of "critical", "high", "medium", "low"
- confidence: numeric value between 0.00 and 1.00 (lower confidence if occluded or uncertain)
- visual_evidence: concrete visual observation of what is visibly seen (e.g., "Worker in center-right region appears to have no visible head protection while under scaffold.")
- location: specific visual area (e.g., "Center scaffold deck", "Foreground transit lane", "Upper right equipment bay")
- explanation: why this visual condition constitutes an industrial safety hazard
- recommended_action: concrete, practical directive for the safety supervisor

Also provide:
- scene_summary: objective description of workplace environment and visible personnel
- persons_detected: integer count of visible personnel
- overall_risk: "critical" | "high" | "medium" | "low" | "none"
- why_flagged: array of concise bullet strings explaining visual factors that triggered this risk status (e.g. ["Personnel observed in active overhead hazard zone", "Protective hard hat not visibly detected"])
- risk_assessment: concise narrative explaining why the observed combination increases risk without claiming certainty beyond what is visible
- recommended_actions: array of prioritized safety directives
- timeline_events: array of chronological observation points

Return strictly valid JSON matching this structure:
{
  "scene_summary": "Active fabrication workshop with structural steel frames.",
  "persons_detected": 1,
  "overall_risk": "high",
  "why_flagged": [
    "Worker detected in active construction sector",
    "Required protective headwear not visibly present"
  ],
  "risk_assessment": "The combination of overhead material handling and absence of head protection significantly elevates the probability of traumatic impact injury.",
  "findings": [
    {
      "type": "missing_helmet",
      "severity": "high",
      "confidence": 0.94,
      "visual_evidence": "Worker in the center-right region appears to have no visible head protection.",
      "location": "Center-right scaffold deck",
      "explanation": "Head protection is mandated in active zones to prevent severe injury from falling debris.",
      "recommended_action": "Verify PPE compliance before work continues."
    }
  ],
  "recommended_actions": [
    "Verify PPE compliance before work continues in Sector 2."
  ],
  "timeline_events": [
    {
      "event_time": "00:01",
      "event_type": "Sector Ingestion",
      "description": "Visual sector scanned for personnel and hazard perimeters",
      "severity": "info"
    }
  ]
}
`;

const fileToGenerativePart = (filePath, mimeType) => {
  const fileBuffer = fs.readFileSync(filePath);
  return {
    inlineData: {
      data: fileBuffer.toString('base64'),
      mimeType,
    },
  };
};

const analyzeMedia = async (filePath, mimeType, fileName, requestedEngine = 'gemini') => {
  // If explicitly requested demo baseline mode
  if (requestedEngine === 'demo_baseline') {
    logger.info(`Explicit Demo Baseline mode requested for ${fileName}`);
    return generateBaselineAnalysis(fileName);
  }

  // Priority 1: Production/Hackathon mode requires real Gemini Vision.
  if (!config.geminiApiKey) {
    logger.error('Gemini Vision analysis attempted, but GEMINI_API_KEY is not configured.');
    throw new AppError(
      'Gemini Vision requires a valid GEMINI_API_KEY configured on the server. Please set GEMINI_API_KEY in backend/.env or select Demo Baseline mode for offline evaluation.',
      400,
      'GEMINI_KEY_MISSING'
    );
  }

  try {
    logger.info(`Executing live Gemini Vision analysis for ${fileName} using model ${config.geminiModel}`);
    const genAI = new GoogleGenerativeAI(config.geminiApiKey);

    const model = genAI.getGenerativeModel({
      model: config.geminiModel,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const imagePart = fileToGenerativePart(filePath, mimeType);
    const prompt = 'Perform comprehensive industrial safety visual audit according to system instructions. Audit visible personnel for missing helmet and missing vest separately. Return structured JSON only.';

    const result = await model.generateContent([SYSTEM_INSTRUCTION, prompt, imagePart]);
    const response = await result.response;
    const text = response.text();

    logger.info(`Received Gemini Vision response for ${fileName}`);

    let parsedData;
    try {
      parsedData = JSON.parse(text);
    } catch (parseError) {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        parsedData = JSON.parse(match[0]);
      } else {
        throw new Error('AI response did not contain a valid JSON object structure.');
      }
    }

    // Support legacy "violations" or "incidents" keys if model used them instead of "findings"
    if (!parsedData.findings && (parsedData.violations || parsedData.incidents)) {
      parsedData.findings = parsedData.violations || parsedData.incidents;
    }

    const validation = geminiVisionResponseSchema.safeParse(parsedData);
    if (!validation.success) {
      logger.warn(`AI response had minor schema deviations, applying safe defaults: ${validation.error.message}`);
      return {
        scene_summary: parsedData.scene_summary || 'Workplace visual analysis completed.',
        persons_detected: Number(parsedData.persons_detected) || 0,
        overall_risk: parsedData.overall_risk || 'medium',
        why_flagged: Array.isArray(parsedData.why_flagged) ? parsedData.why_flagged : ['Visual condition flagged by optical model'],
        risk_assessment: parsedData.risk_assessment || 'Visual findings warrant supervisor review.',
        findings: Array.isArray(parsedData.findings) ? parsedData.findings : [],
        recommended_actions: Array.isArray(parsedData.recommended_actions) ? parsedData.recommended_actions : ['Verify area safety conditions'],
        timeline_events: Array.isArray(parsedData.timeline_events) ? parsedData.timeline_events : [],
        analysis_engine: 'Gemini Vision',
        raw_response: text,
      };
    }

    return {
      ...validation.data,
      analysis_engine: 'Gemini Vision',
      raw_response: text,
    };
  } catch (error) {
    logger.error(`Gemini Vision analysis failed: ${error.message}`, { stack: error.stack });
    // Priority 1: Do NOT silently return baseline fallback in Gemini mode. Return clear error.
    throw new AppError(
      `Gemini Vision analysis failed: ${error.message}. Please verify GEMINI_API_KEY quota and model availability, or select Demo Baseline mode.`,
      502,
      'GEMINI_VISION_ERROR'
    );
  }
};

/**
 * Deterministic baseline inspection result for explicit Demo Baseline mode
 */
const generateBaselineAnalysis = (fileName) => {
  const lower = (fileName || '').toLowerCase();

  if (lower.includes('fall') || lower.includes('slip') || lower.includes('down')) {
    return {
      scene_summary: 'Workplace walkway inspection. Visual pattern indicates horizontal posture anomaly on transit floor.',
      persons_detected: 1,
      overall_risk: 'critical',
      why_flagged: [
        'Worker detected in recumbent position on main walkway',
        'Abrupt loss of upright elevation observed',
        'Potential incapacitation or physical injury hazard',
      ],
      risk_assessment: 'A fallen or recumbent worker in an active transit pathway indicates potential traumatic injury, slip/trip impact, or sudden medical distress requiring immediate first-response intervention.',
      findings: [
        {
          type: 'worker_fall',
          severity: 'critical',
          confidence: 0.92,
          visual_evidence: 'Worker on the walkway floor appears recumbent and stationary with helmet displaced.',
          location: 'Main floor walkway intersection',
          explanation: 'Unresponsive or fallen personnel in active transit corridors risk secondary impact and acute injury.',
          recommended_action: 'Dispatch emergency on-site first responder and verify worker responsiveness immediately.',
        },
      ],
      recommended_actions: [
        'Dispatch emergency first-aid personnel immediately.',
        'Halt equipment transit in the vicinity of incident location.',
        'Review surveillance footage for root-cause slip/trip hazard inspection.',
      ],
      timeline_events: [
        { event_time: '00:01', event_type: 'Sector Scan', description: 'Optical surveillance initialized on sector floor', severity: 'info' },
        { event_time: '00:04', event_type: 'Anomaly Detected', description: 'Recumbent body posture anomaly identified', severity: 'critical' },
        { event_time: '00:06', event_type: 'Alert Triggered', description: 'Critical fall incident logged for safety supervisor', severity: 'critical' },
      ],
      analysis_engine: 'Demo Baseline',
      raw_response: '{"mode":"demo_baseline"}',
    };
  }

  if (lower.includes('fire') || lower.includes('smoke') || lower.includes('hazard')) {
    return {
      scene_summary: 'Industrial work area scan. Visual patterns show dense airborne particulate or thermal vapor discharge.',
      persons_detected: 0,
      overall_risk: 'critical',
      why_flagged: [
        'Visible airborne vapor plume detected near machinery housing',
        'Optical opacity exceeds normal ventilation baseline',
        'Potential thermal combustion hazard',
      ],
      risk_assessment: 'Uncontrolled particulate plumes near mechanical equipment indicate potential friction overheating, electrical ignition, or combustible fluid leakage.',
      findings: [
        {
          type: 'smoke_fire_hazard',
          severity: 'critical',
          confidence: 0.89,
          visual_evidence: 'Dense vapor plume emanating from ventilation duct near motor housing.',
          location: 'Ventilation sector east',
          explanation: 'Thermal signatures or smoke plumes near mechanical systems represent imminent fire risk.',
          recommended_action: 'Sound sector warning, verify thermal telemetry, and ready suppression units.',
        },
      ],
      recommended_actions: [
        'Verify emergency ventilation and shut off combustible fuel lines.',
        'Inspect sector with trained fire response team.',
      ],
      timeline_events: [
        { event_time: '00:02', event_type: 'Smoke Signature', description: 'Visual particulate plume observed', severity: 'critical' },
      ],
      analysis_engine: 'Demo Baseline',
      raw_response: '{"mode":"demo_baseline"}',
    };
  }

  // Default workplace sample: missing PPE
  return {
    scene_summary: 'Active industrial workshop environment. Personnel observed near fabrication scaffold zone.',
    persons_detected: 2,
    overall_risk: 'high',
    why_flagged: [
      'Worker detected in active construction and fabrication sector',
      'Required protective hard hat not visibly present',
      'Worker in transit corridor lacking high-visibility safety vest',
    ],
    risk_assessment: 'Operating in an active fabrication zone without certified headgear and high-visibility apparel substantially raises the likelihood of traumatic impact injuries from overhead tools and collisions with material handling carts.',
    findings: [
      {
        type: 'missing_helmet',
        severity: 'high',
        confidence: 0.94,
        visual_evidence: 'Worker in the center-right region appears to have no visible head protection while under scaffold.',
        location: 'Center scaffold deck, Bay 2',
        explanation: 'Head protection is mandated in active zones to prevent severe injury from falling debris.',
        recommended_action: 'Verify PPE compliance before work continues.',
      },
      {
        type: 'missing_vest',
        severity: 'medium',
        confidence: 0.88,
        visual_evidence: 'Worker in the material handling corridor is not wearing high-visibility reflective apparel.',
        location: 'Corridor intersection B',
        explanation: 'Low visibility in mixed transit corridors increases hazard of collision with transport equipment.',
        recommended_action: 'Instruct personnel to don high-visibility vest before re-entering transit corridor.',
      },
    ],
    recommended_actions: [
      'Verify PPE compliance before work continues in Bay 2.',
      'Provide compliant safety helmet and high-visibility vest to detected individuals.',
      'Log inspection event in daily safety audit sheet.',
    ],
    timeline_events: [
      { event_time: '00:01', event_type: 'Personnel Detection', description: 'Two workers localized in fabrication perimeter', severity: 'info' },
      { event_time: '00:03', event_type: 'PPE Non-Compliance', description: 'Hard hat absence verified with 0.94 confidence', severity: 'high' },
      { event_time: '00:04', event_type: 'PPE Non-Compliance', description: 'Hi-vis vest absence verified with 0.88 confidence', severity: 'medium' },
    ],
    analysis_engine: 'Demo Baseline',
    raw_response: '{"mode":"demo_baseline"}',
  };
};

module.exports = {
  analyzeMedia,
};
