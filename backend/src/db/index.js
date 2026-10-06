const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
const config = require('../config');

let pool = null;
let sqliteDb = null;
let dbType = 'sqlite';

const initDb = async () => {
  if (config.databaseUrl) {
    try {
      console.log('[Database] Connecting to PostgreSQL / Supabase...');
      const isLocalhost = config.databaseUrl.includes('localhost') || config.databaseUrl.includes('127.0.0.1');
      pool = new Pool({
        connectionString: config.databaseUrl,
        ssl: isLocalhost ? false : { rejectUnauthorized: false },
      });
      // Test connection
      await pool.query('SELECT 1');
      dbType = 'postgres';
      console.log('[Database] Connected to PostgreSQL / Supabase successfully.');
      
      const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
      await pool.query(schemaSql);
      console.log('[Database] Schema checked/migrated in PostgreSQL.');
      return;
    } catch (err) {
      console.error('[Database] Failed to connect to PostgreSQL / Supabase:', err.message);
      console.warn('[Database] Falling back to local embedded SQLite storage...');
    }
  }

  // Fallback to SQLite (Node 24 native node:sqlite)
  dbType = 'sqlite';
  const dataDir = path.resolve(__dirname, '../../data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const { DatabaseSync } = require('node:sqlite');
  const dbPath = path.join(dataDir, 'visionguard.sqlite');
  sqliteDb = new DatabaseSync(dbPath);
  console.log(`[Database] Connected to local SQLite storage: ${dbPath}`);

  // Create SQLite tables
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
      user_id TEXT,
      media_type TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      scene_summary TEXT,
      persons_detected INTEGER DEFAULT 0,
      overall_risk TEXT NOT NULL,
      raw_ai_response TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS incidents (
      id TEXT PRIMARY KEY,
      analysis_id TEXT NOT NULL,
      type TEXT NOT NULL,
      severity TEXT NOT NULL,
      confidence REAL NOT NULL,
      description TEXT NOT NULL,
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

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_analyses_created_at ON analyses(created_at);
    CREATE INDEX IF NOT EXISTS idx_analyses_user_id ON analyses(user_id);
    CREATE INDEX IF NOT EXISTS idx_incidents_analysis_id ON incidents(analysis_id);
    CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
    CREATE INDEX IF NOT EXISTS idx_incidents_severity ON incidents(severity);
  `);
  console.log('[Database] SQLite schema initialized.');
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
    // Transform $1, $2, etc. to ?
    let sqliteQuery = text.replace(/\$\d+/g, '?');
    // Replace boolean literals or ILIKE if any
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
