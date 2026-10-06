const fs = require('fs');
const path = require('path');

async function runTestSuite() {
  console.log('--- Starting VisionGuard AI Verification Suite ---');
  const baseUrl = 'http://localhost:4000';

  // 1. Health check
  console.log('[Test 1] Health Check...');
  const healthRes = await fetch(`${baseUrl}/api/health`);
  const healthData = await healthRes.json();
  if (!healthRes.ok || healthData.data?.status !== 'healthy') {
    throw new Error('Health check failed');
  }
  console.log('✓ Health check passed. DB Mode:', healthData.data.database_type);

  // 2. User registration
  console.log('[Test 2] User Registration...');
  const testEmail = `test.officer.${Date.now()}@visionguard.local`;
  const regRes = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Verification Officer',
      email: testEmail,
      password: 'VerifyPassword123!',
      role: 'safety_officer',
    }),
  });
  const regData = await regRes.json();
  if (!regRes.ok || !regData.data?.token) {
    throw new Error('User registration failed');
  }
  const token = regData.data.token;
  console.log('✓ Registration passed. User ID:', regData.data.user.id);

  // 3. User login verification
  console.log('[Test 3] User Login...');
  const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'VerifyPassword123!',
    }),
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok || !loginData.data?.token) {
    throw new Error('Login failed');
  }
  console.log('✓ Login passed.');

  // 4. Invalid login rejection
  console.log('[Test 4] Reject Invalid Password...');
  const badLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'WrongPassword!',
    }),
  });
  if (badLoginRes.status !== 401) {
    throw new Error('Expected 401 for invalid password, got ' + badLoginRes.status);
  }
  console.log('✓ Invalid password rejected with 401.');

  // 5. Ingest Workplace Image
  console.log('[Test 5] Visual Ingestion & Incident Analysis...');
  const formData = new FormData();
  const samplePath = path.resolve(__dirname, '../../test_assets/sample_ppe_violation.png');
  const buffer = fs.readFileSync(samplePath);
  const blob = new Blob([buffer], { type: 'image/png' });
  formData.append('media', blob, 'sample_ppe_violation.png');

  const uploadRes = await fetch(`${baseUrl}/api/analyses`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const uploadData = await uploadRes.json();
  if (!uploadRes.ok || !uploadData.data?.id) {
    throw new Error('Upload analysis failed');
  }
  const analysisId = uploadData.data.id;
  const incidents = uploadData.data.incidents || [];
  console.log(`✓ Analysis succeeded. Created Analysis ID: ${analysisId}, Incidents: ${incidents.length}`);

  if (incidents.length === 0) {
    throw new Error('Expected incidents to be generated');
  }
  const targetIncident = incidents[0];

  // 6. Retrieve Incident by ID
  console.log('[Test 6] Retrieve Incident Dossier...');
  const getIncRes = await fetch(`${baseUrl}/api/incidents/${targetIncident.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const getIncData = await getIncRes.json();
  if (!getIncRes.ok || getIncData.data?.id !== targetIncident.id) {
    throw new Error('Incident retrieval failed');
  }
  console.log('✓ Incident dossier retrieved. Status:', getIncData.data.status);

  // 7. Update Incident Status
  console.log('[Test 7] Transition Incident Status to Resolved...');
  const updateRes = await fetch(`${baseUrl}/api/incidents/${targetIncident.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      status: 'resolved',
      resolution_notes: 'Automated verification test completed successfully.',
    }),
  });
  const updateData = await updateRes.json();
  if (!updateRes.ok || updateData.data?.status !== 'resolved') {
    throw new Error('Status transition to resolved failed');
  }
  console.log('✓ Incident status updated to resolved.');

  // 8. Real Dashboard Aggregation
  console.log('[Test 8] Dashboard Telemetry Aggregation...');
  const dashRes = await fetch(`${baseUrl}/api/dashboard/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const dashData = await dashRes.json();
  if (!dashRes.ok || !dashData.data?.overview) {
    throw new Error('Dashboard stats query failed');
  }
  console.log('✓ Dashboard stats verified:', dashData.data.overview);

  console.log('=== ALL 8 VERIFICATION TESTS PASSED SUCCESSFULLY ===');
}

runTestSuite().catch((err) => {
  console.error('VERIFICATION SUITE FAILED:', err);
  process.exit(1);
});
