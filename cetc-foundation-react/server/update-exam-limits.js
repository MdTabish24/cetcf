'use strict';
require('dotenv').config();
const db = require('./db');

async function updateLimits() {
  console.log('Updating all 225+ trades to 20 questions (10 Easy, 5 Medium, 5 Hard)...');
  
  try {
    const result = await db.query(`
      UPDATE trades 
      SET question_count = 20, 
          difficulty_easy_pct = 50, 
          difficulty_medium_pct = 25, 
          difficulty_hard_pct = 25
    `);
    
    console.log(`✅ Successfully updated ${result.rowCount} trades.`);
  } catch (err) {
    console.error('❌ Failed to update limits:', err);
  } finally {
    process.exit(0);
  }
}

updateLimits();
