'use strict';
/**
 * Seed runner
 * Run: node db/seed-runner.js
 */
const fs = require('fs');
const path = require('path');
const { pool, testConnection } = require('./index');

async function runSeed() {
  console.log('Running CETCF seed data...');

  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('Cannot connect to database. Check server/.env values.');
    process.exit(1);
  }

  const seedPath = path.join(__dirname, 'seed.sql');
  const seedSql = fs.readFileSync(seedPath, 'utf-8');

  try {
    await pool.query(seedSql);
    console.log('Seed completed successfully.');
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSeed().catch((err) => {
  console.error('Unexpected seed error:', err);
  process.exit(1);
});
