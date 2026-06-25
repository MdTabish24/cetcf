#!/usr/bin/env node
/**
 * ============================================================
 * CETCF Content Generation Pipeline — DUAL API
 * ============================================================
 * Uses Claude API (primary) + Gemini API (fallback) to generate:
 * 1. 100 MCQs per course (Hinglish format)
 * 2. Syllabus book content per course (JSON)
 *
 * Usage:
 *   node generate-content.cjs                       # Generate all
 *   node generate-content.cjs --start=10 --count=5  # Generate 5 from index 10
 *   node generate-content.cjs --only-mcqs           # Only MCQs
 *   node generate-content.cjs --only-books          # Only books
 *   node generate-content.cjs --resume              # Resume from last
 * ============================================================
 */
'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');

// ── Configuration ─────────────────────────────────────────────
const CLAUDE_API_KEY = fs.readFileSync(
  path.resolve(__dirname, '..', '..', 'claude_api_key.txt'), 'utf-8'
).trim();

const GEMINI_API_KEY = fs.readFileSync(
  path.resolve(__dirname, '..', '..', 'gemini_api.txt'), 'utf-8'
).trim();

const GENERATED_DIR = path.resolve(__dirname, '..', 'generated');
const MCQ_DIR = path.join(GENERATED_DIR, 'mcqs');
const BOOK_DIR = path.join(GENERATED_DIR, 'books');
const PROGRESS_FILE = path.join(GENERATED_DIR, 'progress.json');
const EXCEL_PATH = path.resolve(__dirname, '..', '..', 'CETCF_Course_List.xlsx');

const DELAY_BETWEEN_CALLS_MS = 3000; // 3s between calls
const MAX_RETRIES = 4;

// ── Helpers ───────────────────────────────────────────────────

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[–—]/g, '-')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf-8'));
  }
  return { mcqs_done: [], books_done: [], errors: [] };
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2), 'utf-8');
}

function loadCourses() {
  const { execSync } = require('child_process');
  const pyScript = path.join(__dirname, 'read_excel.py');
  const result = execSync(`python "${pyScript}" "${EXCEL_PATH}"`, {
    encoding: 'utf-8',
    maxBuffer: 1024 * 1024 * 10,
  });
  return JSON.parse(result.trim());
}

// ── Claude API Call ──────────────────────────────────────────

function callClaude(systemPrompt, userPrompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      model: 'claude-haiku-4-5',
      max_tokens: 16000,
      temperature: 0.7,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const options = {
      hostname: 'api.anthropic.com',
      path: '/v1/messages',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            reject(new Error(`Claude Error [${parsed.error.type}]: ${parsed.error.message}`));
          } else if (parsed.content && parsed.content[0]?.text) {
            if (parsed.stop_reason === 'max_tokens') {
              reject(new Error('Claude hit max_tokens limit (truncated)'));
            } else {
              resolve(parsed.content[0].text);
            }
          } else {
            reject(new Error(`Unexpected Claude response: ${JSON.stringify(parsed).substring(0, 500)}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}\nResponse: ${data.substring(0, 500)}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(180000, () => {
      req.destroy();
      reject(new Error('Request timeout (180s)'));
    });
    req.write(body);
    req.end();
  });
}

// ── Gemini API Call (Fallback) ───────────────────────────────

function callGemini(systemPrompt, userPrompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      system_instruction: {
        parts: [{ text: systemPrompt }]
      },
      contents: [{
        parts: [{ text: userPrompt }]
      }],
      generationConfig: {
        response_mime_type: "application/json",
        temperature: 0.7,
        maxOutputTokens: 65536,
      }
    });

    const url = new URL(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${GEMINI_API_KEY}`);

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            reject(new Error(`Gemini Error [${parsed.error.code}]: ${parsed.error.message}`));
          } else if (parsed.candidates && parsed.candidates[0]?.content?.parts?.[0]?.text) {
            resolve(parsed.candidates[0].content.parts[0].text);
          } else {
            reject(new Error(`Unexpected Gemini response: ${JSON.stringify(parsed).substring(0, 500)}`));
          }
        } catch (e) {
          reject(new Error(`Parse error: ${e.message}\nResponse: ${data.substring(0, 500)}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(180000, () => {
      req.destroy();
      reject(new Error('Request timeout (180s)'));
    });
    req.write(body);
    req.end();
  });
}

// ── Call with Retry + Fallback ───────────────────────────────

async function callGeminiWithRetry(systemPrompt, userPrompt) {
  const retries = 20;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`     (Gemini 2.5 Flash, attempt ${attempt})`);
      const res = await callGemini(systemPrompt, userPrompt);
      extractJSON(res); // Validate
      return res;
    } catch (err) {
      console.error(`  ⚠ Gemini attempt ${attempt}/${retries}: ${err.message.substring(0, 120)}`);
      if (attempt < retries) {
        let delay = DELAY_BETWEEN_CALLS_MS * attempt;
        if (err.message.includes('503') || err.message.includes('429')) {
          delay = 15000; // wait 15s on overload
        }
        console.log(`  ⏳ Retrying in ${delay / 1000}s...`);
        await sleep(delay);
      }
    }
  }
  throw new Error('Gemini API failed after all retries');
}

async function callClaudeWithRetry(systemPrompt, userPrompt) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      console.log(`     (Claude claude-haiku-4-5, attempt ${attempt})`);
      const res = await callClaude(systemPrompt, userPrompt);
      extractJSON(res); // Validate
      return res;
    } catch (err) {
      console.error(`  ⚠ Claude attempt ${attempt}/${MAX_RETRIES}: ${err.message.substring(0, 120)}`);
      if (attempt < MAX_RETRIES) {
        const delay = DELAY_BETWEEN_CALLS_MS * attempt;
        console.log(`  ⏳ Retrying in ${delay / 1000}s...`);
        await sleep(delay);
      }
    }
  }
  throw new Error('Claude API failed after all retries');
}

// ── MCQ Generation ───────────────────────────────────────────

function getMcqPrompt(course) {
  const isITCourse = ['Digital & Information Technology', 'Advanced IT, Programming & Tech Skills'].includes(course.sector);
  const language = isITCourse ? 'English' : 'Hinglish (Hindi + English mix, using Roman script)';

  return {
    system: `You are an expert curriculum designer and question bank creator for CETCF (Council for Education, Training & Certification Foundation), a government-certified body in India. You create professional MCQ examination papers.

CRITICAL RULES:
- Output ONLY valid JSON. No markdown, no backticks, no explanations outside JSON.
- Generate EXACTLY 100 MCQs.
- Each MCQ must have exactly 4 options (A, B, C, D).
- Distribute across 6 modules logically.
- Language: ${language}
- Questions must be practical and job-oriented.
- Mix difficulty: 40% easy, 40% medium, 20% hard.
- Every question must have a clear correct answer and explanation.`,

    user: `Generate a 100-question MCQ examination paper for the course:

COURSE: ${course.name}
SECTOR: ${course.sector}
LEVEL: ${course.level}
DURATION: ${course.duration}

Output as a JSON object with this exact structure:
{
  "course_name": "${course.name}",
  "sector": "${course.sector}",
  "level": "${course.level}",
  "duration": "${course.duration}",
  "total_marks": 100,
  "pass_percentage": 50,
  "exam_duration_minutes": 60,
  "modules": [
    {
      "module_number": 1,
      "module_title": "Module title here",
      "question_range": "Q1-Q17"
    }
  ],
  "questions": [
    {
      "qno": 1,
      "module": 1,
      "question": "Question text here?",
      "options": {
        "A": "Option A text",
        "B": "Option B text",
        "C": "Option C text",
        "D": "Option D text"
      },
      "correct": "A",
      "difficulty": "easy",
      "explanation": "Explanation text here"
    }
  ]
}

Generate all 100 questions distributed across 6 modules. Make questions relevant, practical, and job-oriented for this specific trade.`
  };
}

// ── Book Content Generation ──────────────────────────────────

function getBookPrompt(course) {
  const isITCourse = ['Digital & Information Technology', 'Advanced IT, Programming & Tech Skills'].includes(course.sector);
  const language = isITCourse ? 'English' : 'Hinglish-friendly English (simple, accessible language)';

  const durationMonths = parseInt(course.duration) || 3;
  const totalWeeks = durationMonths * 4;
  const totalHours = durationMonths * 60;

  return {
    system: `You are an expert curriculum designer for CETCF (Council for Education, Training & Certification Foundation), a government-certified body in India. You design comprehensive syllabus content for vocational certification courses.

CRITICAL RULES:
- Output ONLY valid JSON. No markdown, no backticks, no explanations outside JSON.
- Create 6 modules with 8-12 topics each.
- Include practical, job-relevant content.
- Language for descriptions: ${language}
- Make content specific to the Indian context.
- Include realistic career paths with Indian salary ranges.`,

    user: `Generate complete syllabus book content for:

COURSE: ${course.name}
SECTOR: ${course.sector}
LEVEL: ${course.level}
DURATION: ${course.duration} (${totalWeeks} weeks, ~${totalHours} hours)

Output as a JSON object with this exact structure:
{
  "course_name": "${course.name}",
  "sector": "${course.sector}",
  "level": "${course.level}",
  "duration": "${course.duration}",
  "total_weeks": ${totalWeeks},
  "total_hours": ${totalHours},
  "hero_description": "A comprehensive description of this program (2-3 sentences)...",
  "overview_description": "What this program covers (2-3 sentences)...",
  "modules": [
    {
      "number": 1,
      "title": "Module Title",
      "week_range": "Week 1-2",
      "hours": 30,
      "topics": [
        "Topic 1 — brief description",
        "Topic 2 — brief description"
      ]
    }
  ],
  "assessment": {
    "theory_marks": 50,
    "theory_format": "25 Questions x 2 Marks",
    "theory_duration": "45 minutes",
    "practical_marks": 50,
    "practical_format": "Description of practical assessment for this trade",
    "practical_items": [
      {
        "title": "Practical item title",
        "description": "What candidate must submit",
        "marks": 20
      }
    ],
    "total_marks": 100,
    "pass_percentage": 50
  },
  "eligibility": [
    "Minimum age: 14 years",
    "Minimum education: Class 8th pass",
    "No prior experience needed",
    "Already working? Apply for direct RPL exam",
    "Valid ID proof required at registration",
    "Applicable for all candidates"
  ],
  "learning_outcomes": [
    "Outcome 1",
    "Outcome 2",
    "Outcome 3",
    "Outcome 4",
    "Outcome 5",
    "Outcome 6"
  ],
  "career_paths": [
    {
      "title": "Job Title",
      "type": "Employment / Self-Employment / Entrepreneurship",
      "salary": "10000-25000/mo",
      "icon": "emoji"
    }
  ],
  "exam_fee": 1000
}

Make all content specific, practical, and relevant to this exact trade in the Indian job market.`
  };
}

// ── JSON Extraction Helper ──────────────────────────────────

function extractJSON(text) {
  let str = text.trim();
  // Strip markdown code fences
  if (str.startsWith('```')) {
    str = str.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  }
  // Try to find JSON object
  const firstBrace = str.indexOf('{');
  const lastBrace = str.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    str = str.substring(firstBrace, lastBrace + 1);
  }
  return JSON.parse(str);
}

// ── Main Pipeline ────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const startIdx = parseInt(args.find(a => a.startsWith('--start='))?.split('=')[1] || '0');
  const count = parseInt(args.find(a => a.startsWith('--count='))?.split('=')[1] || '999');
  const onlyMcqs = args.includes('--only-mcqs');
  const onlyBooks = args.includes('--only-books');
  const resume = args.includes('--resume');

  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║  CETCF CONTENT GENERATION PIPELINE                  ║');
  console.log('║  Gemini (MCQs) + Claude Haiku 4.5 (Books)           ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  // Ensure output dirs exist
  [MCQ_DIR, BOOK_DIR].forEach(d => {
    if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
  });

  // Load courses from Excel
  console.log('📊 Loading courses from Excel...');
  const allCourses = loadCourses();
  console.log(`   Found ${allCourses.length} courses\n`);

  // Load progress
  const progress = resume ? loadProgress() : { mcqs_done: [], books_done: [], errors: [] };
  if (!resume) {
    // Even without --resume, skip already generated files
    const existingMcqs = fs.existsSync(MCQ_DIR) ? fs.readdirSync(MCQ_DIR).filter(f => f.endsWith('.json')).map(f => f.replace('.json', '')) : [];
    const existingBooks = fs.existsSync(BOOK_DIR) ? fs.readdirSync(BOOK_DIR).filter(f => f.endsWith('.json')).map(f => f.replace('.json', '')) : [];
    progress.mcqs_done = [...new Set([...progress.mcqs_done, ...existingMcqs])];
    progress.books_done = [...new Set([...progress.books_done, ...existingBooks])];
  }

  // Select courses to process
  const courses = allCourses.slice(startIdx, startIdx + count);
  console.log(`🎯 Processing courses ${startIdx + 1} to ${startIdx + courses.length} of ${allCourses.length}`);
  console.log(`   Already done: ${progress.mcqs_done.length} MCQs, ${progress.books_done.length} Books\n`);

  let mcqsGenerated = 0;
  let booksGenerated = 0;
  let errors = 0;

  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];
    const slug = slugify(course.name);
    const courseLabel = `[${startIdx + i + 1}/${allCourses.length}] ${course.name}`;

    console.log(`\n${'═'.repeat(60)}`);
    console.log(`📚 ${courseLabel}`);
    console.log(`   Sector: ${course.sector} | Level: ${course.level} | Duration: ${course.duration}`);
    console.log(`${'─'.repeat(60)}`);

    const tasks = [];

    // ── Generate MCQs ──
    if (!onlyBooks) {
      const mcqFile = path.join(MCQ_DIR, `${slug}.json`);
      if (progress.mcqs_done.includes(slug) || fs.existsSync(mcqFile)) {
        console.log(`   ✅ MCQs already exist — skipping`);
      } else {
        tasks.push((async () => {
          try {
            console.log(`   🤖 Generating 100 MCQs (Gemini)...`);
            const prompt = getMcqPrompt(course);
            const response = await callGeminiWithRetry(prompt.system, prompt.user);
            const mcqData = extractJSON(response);
            fs.writeFileSync(mcqFile, JSON.stringify(mcqData, null, 2), 'utf-8');
            progress.mcqs_done.push(slug);
            saveProgress(progress);
            mcqsGenerated++;
            console.log(`   ✅ MCQs saved (${mcqData.questions?.length || '?'} questions)`);
          } catch (err) {
            console.error(`   ❌ MCQ generation failed: ${err.message}`);
            progress.errors.push({ course: course.name, type: 'mcq', error: err.message, time: new Date().toISOString() });
            saveProgress(progress);
            errors++;
          }
        })());
      }
    }

    // ── Generate Book Content ──
    if (!onlyMcqs) {
      const bookFile = path.join(BOOK_DIR, `${slug}.json`);
      if (progress.books_done.includes(slug) || fs.existsSync(bookFile)) {
        console.log(`   ✅ Book content already exists — skipping`);
      } else {
        tasks.push((async () => {
          try {
            console.log(`   📖 Generating syllabus book content (Claude)...`);
            const prompt = getBookPrompt(course);
            const response = await callClaudeWithRetry(prompt.system, prompt.user);
            const bookData = extractJSON(response);
            fs.writeFileSync(bookFile, JSON.stringify(bookData, null, 2), 'utf-8');
            progress.books_done.push(slug);
            saveProgress(progress);
            booksGenerated++;
            console.log(`   ✅ Book content saved (${bookData.modules?.length || '?'} modules)`);
          } catch (err) {
            console.error(`   ❌ Book generation failed: ${err.message}`);
            progress.errors.push({ course: course.name, type: 'book', error: err.message, time: new Date().toISOString() });
            saveProgress(progress);
            errors++;
          }
        })());
      }
    }

    if (tasks.length > 0) {
      await Promise.all(tasks);
      await sleep(DELAY_BETWEEN_CALLS_MS);
    }
  }

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`✨ GENERATION COMPLETE`);
  console.log(`   MCQs generated: ${mcqsGenerated}`);
  console.log(`   Books generated: ${booksGenerated}`);
  console.log(`   Errors: ${errors}`);
  console.log(`   Total MCQs done: ${progress.mcqs_done.length}`);
  console.log(`   Total Books done: ${progress.books_done.length}`);
  console.log(`${'═'.repeat(60)}\n`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
