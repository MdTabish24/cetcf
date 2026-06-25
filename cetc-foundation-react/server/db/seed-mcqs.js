'use strict';
/**
 * Seed MCQs and Trades
 * Run: node db/seed-mcqs.js
 */
const fs = require('fs');
const path = require('path');
const { pool } = require('./index');

// Helper to extract courses from TS file
function getCoursesFromTS() {
  const tsPath = path.join(__dirname, '../../src/data/courses.ts');
  const tsContent = fs.readFileSync(tsPath, 'utf8');
  const match = tsContent.match(/const RAW_COURSES[\s\S]*?=\s*\[([\s\S]*?)\];/);
  if (!match) throw new Error("Could not find RAW_COURSES in courses.ts");
  
  const rawText = match[1];
  const courseLines = rawText.match(/\[(.*?)\]/g);
  
  return courseLines.map(line => {
    // line looks like: [1, 'Beautician & Makeup Artist', 'Beauty & Lifestyle', '3 Months', 'Foundation']
    // Safe eval since we control the source file
    const parsed = eval(`(${line})`);
    return {
      sno: parsed[0],
      name: parsed[1],
      sector: parsed[2],
      duration: parsed[3],
      level: parsed[4]
    };
  });
}

function getFee(level) {
  switch (level) {
    case 'Advanced': return 2000;
    case 'Intermediate': return 1500;
    default: return 1000;
  }
}

async function runSeeder() {
  console.log('Starting MCQ & Trades Seeding process...');

  try {
    const courses = getCoursesFromTS();
    console.log(`Parsed ${courses.length} courses from courses.ts`);

    // 1. Sync all trades to the database
    for (const course of courses) {
      const code = course.name
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '_')
        .replace(/_+/g, '_')
        .substring(0, 20);

      const fee = getFee(course.level);

      const query = `
        INSERT INTO trades (code, name, description, fee, passing_marks, question_count, duration_mins, commission_rate)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (code) DO UPDATE SET 
          name = EXCLUDED.name,
          fee = EXCLUDED.fee
        RETURNING id;
      `;
      const values = [
        code,
        course.name,
        `${course.level} Level Certification in ${course.name}`,
        fee,
        50, // default pass marks
        100, // default total questions
        60, // default duration mins
        200 // default commission
      ];

      await pool.query(query, values);
    }
    console.log('All trades synced to database successfully.');

    // 2. Map trade names to their DB IDs
    const { rows: dbTrades } = await pool.query('SELECT id, name FROM trades');
    const tradeMap = {};
    dbTrades.forEach(t => {
      tradeMap[t.name] = t.id;
    });

    // 3. Read generated MCQs and insert
    const mcqsDir = path.join(__dirname, '../../generated/mcqs');
    if (!fs.existsSync(mcqsDir)) {
      console.log('No generated MCQs directory found. Run the generator script first.');
      process.exit(0);
    }

    const files = fs.readdirSync(mcqsDir).filter(f => f.endsWith('.json'));
    console.log(`Found ${files.length} MCQ files to process...`);

    let totalInserted = 0;

    for (const file of files) {
      const filePath = path.join(mcqsDir, file);
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

      const tradeId = tradeMap[data.course_name];
      if (!tradeId) {
        console.warn(`WARNING: Could not find trade ID for course name "${data.course_name}" (File: ${file})`);
        continue;
      }

      // First, let's delete existing questions for this trade to avoid duplicates if re-run
      await pool.query('DELETE FROM questions WHERE trade_id = $1', [tradeId]);

      // Insert questions
      for (const q of data.questions) {
        // Ensure options exist
        const opts = q.options || {};
        const qQuery = `
          INSERT INTO questions (trade_id, question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty, explanation, status)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'approved')
        `;
        const qValues = [
          tradeId,
          q.question || 'No Question Text',
          opts.A || 'A',
          opts.B || 'B',
          opts.C || 'C',
          opts.D || 'D',
          q.correct || 'A',
          q.difficulty || 'medium',
          q.explanation || ''
        ];

        try {
          await pool.query(qQuery, qValues);
          totalInserted++;
        } catch (e) {
          console.error(`Error inserting question for ${data.course_name}:`, e.message);
        }
      }
      
      console.log(`✅ Seeded ${data.questions?.length || 0} questions for: ${data.course_name}`);
    }

    console.log(`\n🎉 MCQ Seeding Complete! Total questions inserted: ${totalInserted}`);

  } catch (err) {
    console.error('Seeding failed:', err);
  } finally {
    await pool.end();
  }
}

runSeeder();
