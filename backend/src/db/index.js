const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const config = require('../config');

let pool = null;
let sqliteDb = null;
let dbType = 'sqlite';

const initDb = async () => {
  // Priority 9: In production mode, Supabase PostgreSQL is strictly mandatory.
  if (config.nodeEnv === 'production') {
    if (!config.databaseUrl) {
      console.error('[Production Error] DATABASE_URL is required in production mode. Supabase PostgreSQL must be configured.');
      throw new Error('DATABASE_URL is missing. Production mode requires a connected Supabase PostgreSQL instance and cannot use SQLite fallback.');
    }

    try {
      console.log('[Database] Connecting to production Supabase PostgreSQL...');
      const isLocalhost = config.databaseUrl.includes('localhost') || config.databaseUrl.includes('127.0.0.1');
      pool = new Pool({
        connectionString: config.databaseUrl,
        ssl: isLocalhost ? false : { rejectUnauthorized: false },
      });
      await pool.query('SELECT 1');
      dbType = 'postgres';
      console.log('[Database] Connected to Supabase PostgreSQL successfully.');

      const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
      await pool.query(schemaSql);
      console.log('[Database] Schema verified in Supabase PostgreSQL.');
      return;
    } catch (err) {
      console.error('[Database Fatal] Production Supabase PostgreSQL connection failed:', err.message);
      throw new Error(`Production database connection failed: ${err.message}. Please verify DATABASE_URL.`);
    }
  }

  // Non-production (development / evaluation): If DATABASE_URL provided, try PostgreSQL
  if (config.databaseUrl) {
    try {
      console.log('[Database] Connecting to PostgreSQL / Supabase...');
      const isLocalhost = config.databaseUrl.includes('localhost') || config.databaseUrl.includes('127.0.0.1');
      pool = new Pool({
        connectionString: config.databaseUrl,
        ssl: isLocalhost ? false : { rejectUnauthorized: false },
      });
      await pool.query('SELECT 1');
      dbType = 'postgres';
      console.log('[Database] Connected to PostgreSQL / Supabase successfully.');

      const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
      await pool.query(schemaSql);
      console.log('[Database] Schema verified in PostgreSQL.');
      return;
    } catch (err) {
      console.warn('[Database] PostgreSQL connection failed in development mode. Falling back to local development SQLite storage.');
    }
  }

  // Explicit development SQLite mode
  dbType = 'sqlite';
  const dataDir = path.resolve(__dirname, '../../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const { DatabaseSync } = require('node:sqlite');
  const dbPath = path.join(dataDir, 'visionguard.sqlite');
  sqliteDb = new DatabaseSync(dbPath);
  console.log(`[Database] Local development SQLite active at: ${dbPath}`);

  // Initialize SQLite tables
  sqliteDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'safety_officer',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS analyses (
      id TEXT PRIMARY KEY,
      display_id TEXT NOT NULL DEFAULT 'ANL-2026-00001',
      user_id TEXT,
      media_type TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      scene_summary TEXT,
      persons_detected INTEGER DEFAULT 0,
      overall_risk TEXT NOT NULL,
      analysis_engine TEXT NOT NULL DEFAULT 'Gemini Vision',
      why_flagged TEXT,
      risk_assessment TEXT,
      raw_ai_response TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS incidents (
      id TEXT PRIMARY KEY,
      display_id TEXT NOT NULL DEFAULT 'INC-2026-00001',
      analysis_id TEXT NOT NULL,
      type TEXT NOT NULL,
      severity TEXT NOT NULL,
      confidence REAL NOT NULL,
      description TEXT NOT NULL,
      visual_evidence TEXT,
      explanation TEXT,
      location TEXT,
      recommended_action TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      resolved_at TEXT,
      resolution_notes TEXT,
      FOREIGN KEY (analysis_id) REFERENCES analyses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS analysis_events (
      id TEXT PRIMARY KEY,
      analysis_id TEXT NOT NULL,
      event_time TEXT,
      event_type TEXT NOT NULL,
      description TEXT NOT NULL,
      severity TEXT DEFAULT 'info',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (analysis_id) REFERENCES analyses(id) ON DELETE CASCADE
    );
  `);

  // Ensure newer columns exist in existing SQLite databases
  const ensureColumn = (table, column, colDef) => {
    try {
      sqliteDb.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${colDef}`);
    } catch {
      // Column already exists
    }
  };

  ensureColumn('analyses', 'display_id', "TEXT DEFAULT 'ANL-2026-00001'");
  ensureColumn('analyses', 'analysis_engine', "TEXT DEFAULT 'Gemini Vision'");
  ensureColumn('analyses', 'why_flagged', 'TEXT');
  ensureColumn('analyses', 'risk_assessment', 'TEXT');

  ensureColumn('incidents', 'display_id', "TEXT DEFAULT 'INC-2026-00001'");
  ensureColumn('incidents', 'visual_evidence', 'TEXT');
  ensureColumn('incidents', 'explanation', 'TEXT');

  console.log('[Database] SQLite schema verified with visual evidence and deterministic ID fields.');
};

const query = async (text, params = []) => {
  if (dbType === 'postgres' && pool) {
    const res = await pool.query(text, params);
    return {
      rows: res.rows,
      rowCount: res.rowCount,
    };
  }

  if (sqliteDb) {
    let sqliteQuery = text.replace(/\$\d+/g, '?');
    sqliteQuery = sqliteQuery.replace(/\bILIKE\b/gi, 'LIKE');
    sqliteQuery = sqliteQuery.replace(/\bCURRENT_TIMESTAMP\b/gi, "datetime('now')");

    const trimmed = sqliteQuery.trim().toUpperCase();
    if (trimmed.startsWith('SELECT') || trimmed.startsWith('WITH')) {
      const stmt = sqliteDb.prepare(sqliteQuery);
      const rows = stmt.all(...params);
      return {
        rows,
        rowCount: rows.length,
      };
    } else {
      const stmt = sqliteDb.prepare(sqliteQuery);
      const result = stmt.run(...params);
      return {
        rows: [],
        rowCount: result.changes,
        lastInsertRowid: result.lastInsertRowid,
      };
    }
  }

  throw new Error('Database is not initialized.');
};

module.exports = {
  initDb,
  query,
  getDbType: () => dbType,
};
