# VisionGuard AI

**Autonomous Industrial Safety & Incident Intelligence**

VisionGuard AI is a Computer Vision and Visual Intelligence platform engineered to automate workplace safety monitoring. Industrial and construction facilities traditionally rely on manual visual walk-throughs, which are episodic, subjective, and unable to maintain continuous vigilance over active work zones. VisionGuard AI ingests workplace photography and surveillance video, analyzes scene geometry and personnel using multimodal vision models, validates findings against structured safety schemas, and generates actionable, severity-ranked incident dossiers with recommended remediations.

---

## 1. Problem Statement

Workplace safety compliance in heavy manufacturing, logistics, and construction operations faces structural bottlenecks:
- **Infrequent Auditing:** Safety supervisors can only physically inspect a fraction of job-site sectors at any given moment.
- **Delayed Intervention:** Missing personal protective equipment (PPE), worker falls, or perimeter intrusions are often recognized only after injuries or citations occur.
- **Subjective Documentation:** Manual incident logging lacks objective visual context, repeatable confidence ratings, and standardized remediation steps.

---

## 2. Solution Overview

VisionGuard AI bridges visual inspection and operational remediation:
1. **Visual Ingestion:** Accepts high-resolution photographic evidence and video footage across sectors.
2. **Multimodal Inference:** Executes optical safety checks through Google Gemini Vision with strict negative-prompt controls to prevent hallucination.
3. **Structured Schema Validation:** Validates AI outputs using Zod schemas before persistence.
4. **Autonomous Incident Engine:** Converts detected violations into severity-ranked incident records (`critical`, `high`, `medium`, `low`) with confidence scores.
5. **Operational Intelligence:** Answers what occurred, where it was detected, why it represents risk, and the immediate corrective protocol required.
6. **Compliance Reporting:** Produces printable, audit-ready safety reports with sign-off blocks.

---

## 3. Targeted Visual Safety Domains

Rather than claiming an unbounded detection scope, VisionGuard AI focuses on high-impact industrial safety hazards:
1. **Missing Safety Helmet (Hard Hat):** Personnel working in overhead hazard zones, scaffold decks, and crane paths without head protection.
2. **Missing High-Visibility Safety Vest:** Workers in material transit lanes, forklift bays, and loading docks without Class 2 or 3 reflective garments.
3. **Restricted-Zone Intrusion:** Unauthorized entry into barricaded machinery travel paths, automated robotic bays, and high-voltage perimeters.
4. **Possible Worker Fall / Incapacitation:** Visual identification of horizontal posture, slip/trip events, or recumbent workers requiring immediate first response.
5. **Smoke / Fire / Thermal Hazard:** Visual detection of particulate plumes, uncontained fumes, or early ignition signatures near equipment banks.
6. **General Visual Safety Anomaly:** Unsecured ladders, blocked emergency egress corridors, and uncontained fluid spill hazards.

---

## 4. System Architecture

```text
+--------------------------------------------------------------+
|                    Client Layer (React / Vite)               |
|  - Enterprise Operations Console (Tailwind CSS, Lucide)      |
|  - Real-Time Upload & Multi-Stage Processing Visualizer      |
|  - Incident Dossier Investigation & Resolution Workflows     |
+--------------------------------------------------------------+
                               |
                               | REST API (JWT Bearer Auth)
                               v
+--------------------------------------------------------------+
|                   Backend API (Node.js / Express)            |
|  +--------------------------------------------------------+  |
|  | Middleware: Auth, Zod Validation, Multer Sanitization  |  |
|  +--------------------------------------------------------+  |
|  | Controllers: Auth, Analysis, Incidents, Dashboard      |  |
|  +--------------------------------------------------------+  |
|  | Services:                                              |  |
|  |   - Gemini Vision Service (Structured JSON Generation) |  |
|  |   - Incident Engine (Severity & Confidence Ranking)    |  |
|  |   - Dashboard Telemetry (Live SQL Aggregations)        |  |
|  +--------------------------------------------------------+  |
+--------------------------------------------------------------+
             |                                    |
             v                                    v
+------------------------+          +--------------------------+
|  Google Gemini Vision  |          |   Supabase PostgreSQL    |
|   Multimodal Engine    |          |  (or Local SQLite Engine)|
|  (Server-Side API Key) |          |  Users, Analyses, Events |
+------------------------+          +--------------------------+
```

---

## 5. Technology Stack

- **Frontend:** React 19, Vite 8, Tailwind CSS, React Router 7, Lucide React
- **Backend:** Node.js 24, Express 5, Multer, Zod, BcryptJS, JSON Web Tokens
- **AI / Vision:** Google Gemini API (`gemini-1.5-flash`), Structured JSON Schema enforcement
- **Database:** Supabase PostgreSQL (via `pg` driver) with resilient local SQLite fallback
- **Deployment Targets:** Vercel (Frontend SPA), Render (Backend API Web Service), Supabase (Database)

---

## 6. Database Schema

The database uses relational integrity with foreign key cascading and indexed queries:

```sql
-- Core users registry
CREATE TABLE users (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'safety_officer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Processed visual audit records
CREATE TABLE analyses (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  media_type VARCHAR(50) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  scene_summary TEXT,
  persons_detected INTEGER DEFAULT 0,
  overall_risk VARCHAR(50) NOT NULL,
  raw_ai_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Operational safety incidents
CREATE TABLE incidents (
  id VARCHAR(64) PRIMARY KEY,
  analysis_id VARCHAR(64) NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  type VARCHAR(100) NOT NULL,
  severity VARCHAR(50) NOT NULL,
  confidence NUMERIC(4, 2) NOT NULL,
  description TEXT NOT NULL,
  location VARCHAR(255),
  recommended_action TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT
);

-- Chronological detection events
CREATE TABLE analysis_events (
  id VARCHAR(64) PRIMARY KEY,
  analysis_id VARCHAR(64) NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  event_time VARCHAR(50),
  event_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  severity VARCHAR(50) DEFAULT 'info',
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

---

## 7. API Reference

### Authentication
- `POST /api/auth/register` - Create new safety officer account
- `POST /api/auth/login` - Authenticate with email and password
- `GET /api/auth/me` - Retrieve current session profile

### Visual Analyses
- `POST /api/analyses` - Ingest media (multipart form-data: `media`) and execute vision pipeline
- `GET /api/analyses` - List audit history with pagination
- `GET /api/analyses/:id` - Retrieve full analysis record with timeline and findings

### Incident Management
- `GET /api/incidents` - Query incidents with optional filters (`status`, `severity`, `type`)
- `GET /api/incidents/:id` - Retrieve investigation dossier
- `PATCH /api/incidents/:id/status` - Transition status (`open`, `acknowledged`, `resolved`) with notes

### Telemetry & Health
- `GET /api/dashboard/stats` - Fetch real database aggregations (zero fabricated numbers)
- `GET /api/health` - Check API engine status and active database backend

---

## 8. Environment Variables

Create `.env` based on `.env.example`:

| Variable | Description | Default |
|---|---|---|
| `PORT` | Backend port | `4000` |
| `NODE_ENV` | Environment mode (`development` or `production`) | `development` |
| `DATABASE_URL` | Supabase PostgreSQL connection string | *Optional (defaults to local SQLite)* |
| `JWT_SECRET` | Secret key for JWT signing | `visionguard_dev_secret_key` |
| `GEMINI_API_KEY` | Google Gemini API key for vision inference | *Required for live Gemini* |
| `GEMINI_MODEL` | Gemini vision model identifier | `gemini-1.5-flash` |
| `FRONTEND_URL` | Allowed CORS frontend origin | `http://localhost:5173` |

---

## 9. Local Installation & Setup

### Prerequisites
- Node.js v20+ or v24+
- npm v10+

### Steps
1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd classroom-hacakthon
   ```

2. Install dependencies:
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   cd ..
   ```

3. Configure environment:
   ```bash
   cp .env.example backend/.env
   # Add your GEMINI_API_KEY and DATABASE_URL if connecting to Supabase
   ```

4. Launch services:
   ```bash
   # Terminal 1: Backend
   npm run dev:backend

   # Terminal 2: Frontend
   npm run dev:frontend
   ```
5. Open browser at `http://localhost:5173`.

---

## 10. Recommended 3 to 5 Minute Demo Script

1. **Accessing the Console:** Open `http://localhost:5173`. Point out the industrial design language (no purple gradients, no fake customer logos, no neon AI clichés). Click **Sign In** and use the pre-fill button to authenticate as Chief Inspector Miller.
2. **Dashboard Review:** Note the live KPIs (Total Analyses, Open Incidents, Critical Incidents, Resolved Incidents). Note that metrics reflect actual database rows without fabricated counters.
3. **Execute Workplace Audit:** Navigate to **Analyze**. Select one of the preset benchmark scenarios (e.g., *Scaffold PPE Non-Compliance* or *Floor Transit Walkway Fall*) or upload an image. Observe the real-time stage transitions: Media Ingestion -> Visual AI Inference -> Risk Evaluation -> Incident Persistence.
4. **Examine Generated Incidents:** Review the detected findings, optical confidence ratings, and immediate recommended supervisor directives.
5. **Investigate Incident Dossier:** Click **Investigate** to open the incident dossier. Highlight the 7 core questions answered: What happened, Where it happened, Classification, Confidence, Severity, Why it is risky, and What to do next.
6. **Incident Resolution Protocol:** Change the incident status from `Open` to `Acknowledged`, then to `Resolved` with resolution notes (e.g., "Hard hat issued to worker in Bay 2, compliance re-verified").
7. **Verify Dashboard Update:** Return to **Overview**. Show that the real counts dynamically incremented resolved incidents and decremented open incidents.
8. **Generate Compliance Report:** Navigate to **Reports**, select the incident, and demonstrate the formal printable OSHA audit dossier with sign-off blocks.

---

## 11. Safety Advisory & Limitations

- **Decision-Support Software:** VisionGuard AI produces probabilistic computer vision findings and does not replace statutory OSHA inspections or designated human safety officers.
- **Lighting and Occlusion:** Optical models may experience reduced confidence in extreme low-light environments or heavy physical occlusions.
- **Human-in-the-Loop:** All automated findings require human officer verification prior to formal disciplinary or regulatory action.
