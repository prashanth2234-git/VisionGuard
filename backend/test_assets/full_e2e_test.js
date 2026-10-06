const fs = require('fs');
const path = require('path');

async function runFullQA() {
  console.log('====================================================');
  console.log('VISIONGUARD AI FINAL PRODUCT + CV QUALITY PASS QA');
  console.log('====================================================');

  const baseUrl = 'http://localhost:4000';
  const results = {};

  // 1. Health check & Engine online
  try {
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthRes.json();
    if (healthRes.ok && healthData.data?.status === 'healthy') {
      results['API Health & Engine Status'] = { status: 'PASS', detail: `DB Engine: ${healthData.data.database_type}` };
    } else {
      results['API Health & Engine Status'] = { status: 'FAIL', detail: 'Health check response invalid' };
    }
  } catch (err) {
    results['API Health & Engine Status'] = { status: 'FAIL', detail: err.message };
  }

  // 2. Authentication: Registration
  let token = null;
  const testEmail = `qa.officer.${Date.now()}@visionguard.local`;
  try {
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Lead Inspector Jenkins',
        email: testEmail,
        password: 'ValidPassword2026!',
        role: 'safety_officer',
      }),
    });
    const regData = await regRes.json();
    if (regRes.ok && regData.data?.token) {
      token = regData.data.token;
      results['Authentication: Registration'] = { status: 'PASS', detail: `Registered user: ${regData.data.user.id}` };
    } else {
      results['Authentication: Registration'] = { status: 'FAIL', detail: regData.error?.message };
    }
  } catch (err) {
    results['Authentication: Registration'] = { status: 'FAIL', detail: err.message };
  }

  // 3. Authentication: Login & Verification
  try {
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'ValidPassword2026!',
      }),
    });
    const loginData = await loginRes.json();
    if (loginRes.ok && loginData.data?.token) {
      results['Authentication: Login & Token'] = { status: 'PASS', detail: 'JWT generated with bcrypt verification' };
    } else {
      results['Authentication: Login & Token'] = { status: 'FAIL', detail: loginData.error?.message };
    }
  } catch (err) {
    results['Authentication: Login & Token'] = { status: 'FAIL', detail: err.message };
  }

  // 4. Authentication: Invalid Credentials Rejection
  try {
    const badLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'WrongPassword!',
      }),
    });
    if (badLoginRes.status === 401) {
      results['Authentication: Bad Password Rejection'] = { status: 'PASS', detail: '401 Unauthorized returned' };
    } else {
      results['Authentication: Bad Password Rejection'] = { status: 'FAIL', detail: `Expected 401, got ${badLoginRes.status}` };
    }
  } catch (err) {
    results['Authentication: Bad Password Rejection'] = { status: 'FAIL', detail: err.message };
  }

  // 5. Priority 1 Test: Gemini Mode without key MUST NOT silently fallback; must return clear error
  try {
    const formData = new FormData();
    const samplePath = path.resolve(__dirname, '../../test_assets/sample_ppe_violation.png');
    const buffer = fs.readFileSync(samplePath);
    formData.append('media', new Blob([buffer], { type: 'image/png' }), 'sample_ppe_violation.png');
    formData.append('engine', 'gemini');

    const geminiTestRes = await fetch(`${baseUrl}/api/analyses`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const geminiTestData = await geminiTestRes.json();

    if (!geminiTestRes.ok && geminiTestData.error?.code === 'GEMINI_KEY_MISSING') {
      results['Priority 1: Real Gemini Enforcement (No Silent Fallback)'] = {
        status: 'PASS',
        detail: 'Explicitly refused to silently fake results when GEMINI_API_KEY was absent; returned 400 GEMINI_KEY_MISSING',
      };
    } else if (geminiTestRes.ok && geminiTestData.data?.analysis_engine === 'Gemini Vision') {
      results['Priority 1: Real Gemini Enforcement (No Silent Fallback)'] = {
        status: 'PASS',
        detail: 'Live Gemini Vision inference executed successfully',
      };
    } else {
      results['Priority 1: Real Gemini Enforcement (No Silent Fallback)'] = {
        status: 'FAIL',
        detail: `Expected GEMINI_KEY_MISSING error or live Gemini execution, got status ${geminiTestRes.status}`,
      };
    }
  } catch (err) {
    results['Priority 1: Real Gemini Enforcement (No Silent Fallback)'] = { status: 'FAIL', detail: err.message };
  }

  // 6. Explicit Demo Baseline Mode & Computer Vision Evidence Generation
  let createdIncidentId = null;
  let createdAnalysisId = null;
  try {
    const formData = new FormData();
    const samplePath = path.resolve(__dirname, '../../test_assets/sample_ppe_violation.png');
    const buffer = fs.readFileSync(samplePath);
    formData.append('media', new Blob([buffer], { type: 'image/png' }), 'sample_ppe_violation.png');
    formData.append('engine', 'demo_baseline');

    const uploadRes = await fetch(`${baseUrl}/api/analyses`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    const uploadData = await uploadRes.json();

    if (uploadRes.ok && uploadData.data?.display_id && uploadData.data?.analysis_engine === 'Demo Baseline') {
      createdAnalysisId = uploadData.data.id;
      const findings = uploadData.data.findings || [];
      const hasEvidence = findings.every((f) => f.visual_evidence && f.recommended_action && f.display_id);
      const hasRiskReasoning = Array.isArray(uploadData.data.why_flagged) && uploadData.data.why_flagged.length > 0;

      if (hasEvidence && hasRiskReasoning) {
        createdIncidentId = findings[0]?.id;
        results['Priority 2, 4, 5, 6, 7: CV Evidence & Risk Reasoning Pipeline'] = {
          status: 'PASS',
          detail: `Generated ${uploadData.data.display_id} with ${findings.length} findings, visual evidence, deterministic IDs (${findings[0]?.display_id}), and risk reasoning`,
        };
      } else {
        results['Priority 2, 4, 5, 6, 7: CV Evidence & Risk Reasoning Pipeline'] = {
          status: 'FAIL',
          detail: 'Findings missing visual evidence or risk reasoning fields',
        };
      }
    } else {
      results['Priority 2, 4, 5, 6, 7: CV Evidence & Risk Reasoning Pipeline'] = {
        status: 'FAIL',
        detail: uploadData.error?.message || 'Upload failed',
      };
    }
  } catch (err) {
    results['Priority 2, 4, 5, 6, 7: CV Evidence & Risk Reasoning Pipeline'] = { status: 'FAIL', detail: err.message };
  }

  // 7. Incident Investigation Dossier Retrieval
  try {
    if (!createdIncidentId) throw new Error('No incident ID available from previous step');
    const incRes = await fetch(`${baseUrl}/api/incidents/${createdIncidentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const incData = await incRes.json();

    if (incRes.ok && incData.data?.display_id && incData.data?.visual_evidence) {
      results['Incident Dossier Retrieval & CV Evidence Verification'] = {
        status: 'PASS',
        detail: `Retrieved ${incData.data.display_id} with visual evidence and analysis link ${incData.data.analysis_display_id}`,
      };
    } else {
      results['Incident Dossier Retrieval & CV Evidence Verification'] = {
        status: 'FAIL',
        detail: 'Failed to retrieve complete dossier with evidence',
      };
    }
  } catch (err) {
    results['Incident Dossier Retrieval & CV Evidence Verification'] = { status: 'FAIL', detail: err.message };
  }

  // 8. Incident Status Transition: Open -> Acknowledged -> Resolved
  try {
    if (!createdIncidentId) throw new Error('No incident ID available');

    // Step A: Acknowledge
    const ackRes = await fetch(`${baseUrl}/api/incidents/${createdIncidentId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: 'acknowledged',
        resolution_notes: 'Safety officer en route to verify scaffold deck Bay 2.',
      }),
    });
    const ackData = await ackRes.json();

    // Step B: Resolve
    const resRes = await fetch(`${baseUrl}/api/incidents/${createdIncidentId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: 'resolved',
        resolution_notes: 'Hard hat issued to personnel. Compliance re-verified.',
      }),
    });
    const resData = await resRes.json();

    if (ackData.data?.status === 'acknowledged' && resData.data?.status === 'resolved' && resData.data?.resolved_at) {
      results['Incident Lifecycle: Status Updates & Resolution Notes'] = {
        status: 'PASS',
        detail: `Transitioned open -> acknowledged -> resolved with persistent timestamp: ${resData.data.resolved_at}`,
      };
    } else {
      results['Incident Lifecycle: Status Updates & Resolution Notes'] = {
        status: 'FAIL',
        detail: 'Status update did not persist correctly',
      };
    }
  } catch (err) {
    results['Incident Lifecycle: Status Updates & Resolution Notes'] = { status: 'FAIL', detail: err.message };
  }

  // 9. Dashboard Aggregations (Database-Driven)
  try {
    const dashRes = await fetch(`${baseUrl}/api/dashboard/stats`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const dashData = await dashRes.json();

    if (dashRes.ok && dashData.data?.overview) {
      const o = dashData.data.overview;
      results['Database-driven Dashboard Aggregation'] = {
        status: 'PASS',
        detail: `Total Analyses: ${o.total_analyses}, Total Incidents: ${o.total_incidents}, Resolved: ${o.resolved_incidents}, Open: ${o.open_incidents}`,
      };
    } else {
      results['Database-driven Dashboard Aggregation'] = { status: 'FAIL', detail: 'Failed to aggregate metrics' };
    }
  } catch (err) {
    results['Database-driven Dashboard Aggregation'] = { status: 'FAIL', detail: err.message };
  }

  // 10. Priority 9 Test: Production Database Protection Rule
  try {
    // Test that require('../db') in production mode without DATABASE_URL throws
    const { execSync } = require('child_process');
    let threwError = false;
    try {
      execSync('node -e "process.env.NODE_ENV=\'production\'; delete process.env.DATABASE_URL; const db = require(\'./backend/src/db\'); db.initDb().catch(e => { process.exit(42); });"', {
        stdio: 'pipe',
      });
    } catch (e) {
      if (e.status === 42 || e.status === 1) {
        threwError = true;
      }
    }
    if (threwError) {
      results['Priority 9: Production Architecture (Supabase Mandatory)'] = {
        status: 'PASS',
        detail: 'Refuses silent SQLite fallback in production; strictly requires DATABASE_URL',
      };
    } else {
      results['Priority 9: Production Architecture (Supabase Mandatory)'] = {
        status: 'FAIL',
        detail: 'Did not throw error when DATABASE_URL was absent in production mode',
      };
    }
  } catch (err) {
    results['Priority 9: Production Architecture (Supabase Mandatory)'] = { status: 'FAIL', detail: err.message };
  }

  console.log('\n--- DETAILED QA SUMMARY MATRIX ---');
  for (const [testName, res] of Object.entries(results)) {
    console.log(`[${res.status}] ${testName}: ${res.detail}`);
  }

  return results;
}

runFullQA().catch((err) => {
  console.error('QA Execution Error:', err);
  process.exit(1);
});
