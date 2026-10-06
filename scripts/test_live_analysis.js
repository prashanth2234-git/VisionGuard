const fs = require('fs');
const http = require('http');
const path = require('path');

async function run() {
  console.log('--- VISIONGUARD END-TO-END LIVE GEMINI VERIFICATION ---');

  // 1. Authenticate with an automated test officer account
  const timestamp = Date.now();
  const testUser = {
    name: 'Lead Safety Auditor',
    email: `auditor.${timestamp}@visionguard.ai`,
    password: 'SecurePassword2026!',
    role: 'safety_officer'
  };

  const regData = JSON.stringify(testUser);
  const authRes = await new Promise((resolve, reject) => {
    const req = http.request('http://localhost:4000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(regData)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', reject);
    req.write(regData);
    req.end();
  });

  const token = authRes?.data?.token;
  console.log(`[AUTH] Login success: ${authRes.success}, Token present: ${Boolean(token)}`);

  if (!token) {
    console.error('[AUTH] Failed:', authRes);
    process.exit(1);
  }

  // 2. Prepare multipart upload with realistic workplace image
  const boundary = '----WebKitFormBoundaryVisionGuard77';
  const filePath = path.resolve(__dirname, '../test_assets/construction_ppe_hazard.jpg');
  const fileBuffer = fs.readFileSync(filePath);

  const payloadHeader = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="engine"',
    '',
    'gemini',
    `--${boundary}`,
    'Content-Disposition: form-data; name="media"; filename="construction_ppe_hazard.jpg"',
    'Content-Type: image/jpeg',
    '',
    ''
  ].join('\r\n');

  const payloadFooter = `\r\n--${boundary}--\r\n`;

  const fullBody = Buffer.concat([
    Buffer.from(payloadHeader, 'utf8'),
    fileBuffer,
    Buffer.from(payloadFooter, 'utf8')
  ]);

  console.log('[UPLOAD] Ingesting media and dispatching to Gemini Vision engine...');
  const uploadRes = await new Promise((resolve, reject) => {
    const req = http.request('http://localhost:4000/api/analyses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': fullBody.length
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, data: JSON.parse(body) }));
    });
    req.on('error', reject);
    req.write(fullBody);
    req.end();
  });

  console.log(`[ANALYSIS] HTTP Status Code: ${uploadRes.statusCode}`);
  console.log(`[ANALYSIS] Success flag: ${uploadRes.data.success}`);

  if (uploadRes.data.success && uploadRes.data.data) {
    const d = uploadRes.data.data;
    console.log(`[ANALYSIS] Display ID: ${d.display_id}`);
    console.log(`[ANALYSIS] Analysis Engine: ${d.analysis_engine}`);
    console.log(`[ANALYSIS] Scene Summary: ${d.scene_summary}`);
    console.log(`[ANALYSIS] Persons Detected: ${d.persons_detected}`);
    console.log(`[ANALYSIS] Overall Risk: ${d.overall_risk}`);
    console.log(`[ANALYSIS] Why Flagged: ${JSON.stringify(d.why_flagged, null, 2)}`);
    console.log(`[ANALYSIS] Risk Assessment: ${d.risk_assessment}`);
    console.log(`[ANALYSIS] Findings Count: ${(d.findings || []).length}`);
    (d.findings || []).forEach((f, idx) => {
      console.log(`  --- Finding #${idx + 1}: ${f.type.toUpperCase()} [${f.severity.toUpperCase()}] ---`);
      console.log(`      Confidence: ${(f.confidence * 100).toFixed(0)}%`);
      console.log(`      Location: ${f.location}`);
      console.log(`      Visual Evidence: ${f.visual_evidence}`);
      console.log(`      Recommended Action: ${f.recommended_action}`);
    });
    console.log(`[ANALYSIS] Created Incidents Count: ${(d.incidents || []).length}`);
    (d.incidents || []).forEach((inc) => {
      console.log(`      Incident ID: ${inc.display_id} | Type: ${inc.type} | Severity: ${inc.severity}`);
    });

    // 3. Test retrieving the analysis
    const getRes = await new Promise((resolve, reject) => {
      const req = http.request(`http://localhost:4000/api/analyses/${d.id}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      }, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, data: JSON.parse(body) }));
      });
      req.on('error', reject);
      req.end();
    });

    console.log(`[GET ANALYSIS] Retrieval status: ${getRes.statusCode}, Success: ${getRes.data.success}`);
    console.log('--- LIVE GEMINI VERIFICATION COMPLETED SUCCESSFULLY ---');
  } else {
    console.error('[ANALYSIS] Error response:', JSON.stringify(uploadRes.data, null, 2));
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('[FATAL]', err);
  process.exit(1);
});
