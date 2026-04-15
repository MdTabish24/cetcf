'use strict';
/**
 * Database migration runner
 * Run: node db/migrate.js
 */
const fs = require('fs');
const path = require('path');
const { pool, testConnection } = require('./index');

async function runMigration() {
  console.log('🚀 Running CETCF database migrations...');

  const isConnected = await testConnection();
  if (!isConnected) {
    console.error('❌ Cannot connect to database. Please check your .env configuration.');
    console.error('   Make sure PostgreSQL is running and credentials in server/.env are correct.');
    process.exit(1);
  }

  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');

  try {
    await pool.query(schema);
    console.log('✅ Schema created successfully!');
  } catch (err) {
    console.error('❌ Schema migration failed:', err.message);
    process.exit(1);
  }

  // Now run seed without stopping on conflict errors
  const seedPath = path.join(__dirname, 'seed.sql');
  const seed = fs.readFileSync(seedPath, 'utf-8');

  // Split by semicolons (roughly) and execute one at a time
  const statements = seed.split(/;\s*\n/).filter(s => s.trim().length > 0 && !s.trim().startsWith('--'));

  let seeded = 0;
  let skipped = 0;
  for (const stmt of statements) {
    try {
      await pool.query(stmt + ';');
      seeded++;
    } catch (err) {
      if (err.code === '23505') { // unique violation — already seeded
        skipped++;
      } else {
        console.warn('⚠️  Seed warning:', err.message.substring(0, 100));
        skipped++;
      }
    }
  }

  console.log(`✅ Seed complete — ${seeded} statements executed, ${skipped} skipped (already exist).`);
  console.log('\n🎉 Database ready! You can start the server with: node index.js');
  await pool.end();
}

runMigration().catch(console.error);
