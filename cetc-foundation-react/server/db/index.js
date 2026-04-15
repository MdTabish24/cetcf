'use strict';
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'cetcf_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

/**
 * Execute a single query
 */
async function query(text, params) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV !== 'production') {
    console.log('[DB]', { query: text.substring(0, 80), duration, rows: res.rowCount });
  }
  return res;
}

/**
 * Get a client from pool for transactions
 */
async function getClient() {
  const client = await pool.connect();
  const originalQuery = client.query.bind(client);
  const release = client.release.bind(client);
  client.query = (...args) => originalQuery(...args);
  client.release = () => {
    client.query = originalQuery;
    client.release = release;
    return release();
  };
  return client;
}

/**
 * Execute transaction with automatic rollback
 */
async function withTransaction(callback) {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Test database connection
 */
async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW() as now, current_database() as db');
    console.log(`✅ Database connected: ${res.rows[0].db} at ${res.rows[0].now}`);
    return true;
  } catch (err) {
    console.warn(`⚠️  Database not available: ${err.message}`);
    return false;
  }
}

module.exports = { query, getClient, withTransaction, testConnection, pool };
