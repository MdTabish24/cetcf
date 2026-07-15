const db = require('./db');

async function cleanTestData() {
  try {
    const client = await db.getClient();
    await client.query('BEGIN');

    // Find the test user
    const res = await client.query("SELECT id FROM users WHERE mobile = '9999999999'");
    if (res.rows.length) {
      const testUserId = res.rows[0].id;
      
      // Get test user candidates
      const candRes = await client.query("SELECT id FROM candidates WHERE user_id = $1", [testUserId]);
      const candIds = candRes.rows.map(r => r.id);
      
      if (candIds.length) {
        await client.query("DELETE FROM certificates WHERE candidate_id = ANY($1)", [candIds]);
        await client.query("DELETE FROM exams WHERE candidate_id = ANY($1)", [candIds]);
      }
      
      await client.query("DELETE FROM payments WHERE user_id = $1", [testUserId]);
      await client.query("DELETE FROM candidates WHERE user_id = $1", [testUserId]);
      await client.query("DELETE FROM users WHERE id = $1", [testUserId]);
      
      console.log('Test user (9999999999) and all related data completely deleted.');
    } else {
      console.log('Test user (9999999999) not found.');
    }

    // Fix max attempts on existing candidates
    await client.query("UPDATE candidates SET max_attempts = 1 WHERE max_attempts > 1");
    console.log('Updated existing candidates to max_attempts = 1.');

    await client.query('COMMIT');
    client.release();
    process.exit(0);
  } catch (err) {
    console.error('Error cleaning data:', err);
    process.exit(1);
  }
}

cleanTestData();
