#!/usr/bin/env node
/**
 * Convert all generated book JSONs → styled HTML files for SyllabusBookViewer
 * Reads from: generated/books/*.json
 * Outputs to: public/html_books/{slug}.html
 */
'use strict';

const fs = require('fs');
const path = require('path');

const BOOKS_DIR = path.resolve(__dirname, '..', 'generated', 'books');
const OUTPUT_DIR = path.resolve(__dirname, '..', 'public', 'html_books');

// Ensure output dir exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function generateBookHtml(data, slug) {
  const courseName = data.course_name || slug;
  const sector = data.sector || '';
  const level = data.level || '';
  const duration = data.duration || '';
  const totalHours = data.total_hours || '';
  const heroDesc = data.hero_description || `A comprehensive ${duration} certification program.`;
  const modules = data.modules || [];
  const eligibility = data.eligibility || [];
  const learningOutcomes = data.learning_outcomes || [];
  const careerPaths = data.career_paths || [];
  const assessment = data.assessment || {};
  const examFee = data.exam_fee || 1000;

  // Build modules HTML
  let modulesHtml = '';
  for (const mod of modules) {
    const modNum = mod.module_number || mod.number || '';
    const modTitle = mod.title || mod.module_title || '';
    const topics = mod.topics || [];
    const practicals = mod.practicals || mod.practical || [];
    const keyTakeaways = mod.key_takeaways || mod.takeaways || [];

    let topicsHtml = '';
    if (topics.length > 0) {
      topicsHtml = `<h3>📚 Topics Covered</h3><ul>${topics.map(t => `<li>${escapeHtml(typeof t === 'string' ? t : t.name || t.title || JSON.stringify(t))}</li>`).join('')}</ul>`;
    }

    let practicalsHtml = '';
    if (practicals.length > 0) {
      practicalsHtml = `<h3>🔧 Practical Activities</h3><ul>${practicals.map(p => `<li>${escapeHtml(typeof p === 'string' ? p : p.name || p.title || JSON.stringify(p))}</li>`).join('')}</ul>`;
    }

    let takeawaysHtml = '';
    if (keyTakeaways.length > 0) {
      takeawaysHtml = `<h3>🎯 Key Takeaways</h3><ul>${keyTakeaways.map(k => `<li>${escapeHtml(typeof k === 'string' ? k : k.name || k.title || JSON.stringify(k))}</li>`).join('')}</ul>`;
    }

    modulesHtml += `
      <div class="module">
        <h2>Module ${modNum}: ${escapeHtml(modTitle)}</h2>
        ${topicsHtml}
        ${practicalsHtml}
        ${takeawaysHtml}
      </div>
    `;
  }

  // Eligibility
  let eligibilityHtml = '';
  if (eligibility.length > 0) {
    eligibilityHtml = `
      <div class="module">
        <h2>✅ Eligibility Criteria</h2>
        <ul>${eligibility.map(e => `<li>${escapeHtml(typeof e === 'string' ? e : JSON.stringify(e))}</li>`).join('')}</ul>
      </div>
    `;
  }

  // Learning outcomes
  let outcomesHtml = '';
  if (learningOutcomes.length > 0) {
    outcomesHtml = `
      <div class="module">
        <h2>🎓 Learning Outcomes</h2>
        <ul>${learningOutcomes.map(l => `<li>${escapeHtml(typeof l === 'string' ? l : JSON.stringify(l))}</li>`).join('')}</ul>
      </div>
    `;
  }

  // Career paths
  let careerHtml = '';
  if (careerPaths.length > 0) {
    careerHtml = `
      <div class="module">
        <h2>💼 Career Paths</h2>
        <div class="career-grid">
          ${careerPaths.map(c => {
            if (typeof c === 'string') return `<div class="career-item"><strong>${escapeHtml(c)}</strong></div>`;
            return `<div class="career-item"><strong>${escapeHtml(c.title || c.role || '')}</strong><br/><small>${escapeHtml(c.description || c.salary || '')}</small></div>`;
          }).join('')}
        </div>
      </div>
    `;
  }

  // Assessment
  let assessmentHtml = '';
  if (assessment && (assessment.theory || assessment.practical || assessment.mcq)) {
    assessmentHtml = `
      <div class="module">
        <h2>📝 Assessment Structure</h2>
        <table style="width:100%; border-collapse:collapse; margin-top:10px;">
          <tr style="background:#f1f5f9;">
            <th style="padding:10px; text-align:left; border:1px solid #e2e8f0;">Component</th>
            <th style="padding:10px; text-align:left; border:1px solid #e2e8f0;">Marks</th>
            <th style="padding:10px; text-align:left; border:1px solid #e2e8f0;">Details</th>
          </tr>
          ${assessment.theory ? `<tr><td style="padding:10px; border:1px solid #e2e8f0;">Theory (MCQ)</td><td style="padding:10px; border:1px solid #e2e8f0;">${assessment.theory.marks || 50}</td><td style="padding:10px; border:1px solid #e2e8f0;">${escapeHtml(assessment.theory.description || 'Multiple choice questions')}</td></tr>` : ''}
          ${assessment.practical ? `<tr><td style="padding:10px; border:1px solid #e2e8f0;">Practical</td><td style="padding:10px; border:1px solid #e2e8f0;">${assessment.practical.marks || 50}</td><td style="padding:10px; border:1px solid #e2e8f0;">${escapeHtml(assessment.practical.description || 'Practical assessment')}</td></tr>` : ''}
          ${assessment.mcq ? `<tr><td style="padding:10px; border:1px solid #e2e8f0;">MCQ Exam</td><td style="padding:10px; border:1px solid #e2e8f0;">${assessment.mcq.marks || 100}</td><td style="padding:10px; border:1px solid #e2e8f0;">${escapeHtml(assessment.mcq.description || '100 MCQ questions')}</td></tr>` : ''}
        </table>
      </div>
    `;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(courseName)} — CETCF Syllabus</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; }
    .container { max-width: 900px; margin: 0 auto; padding: 30px 20px; }
    h1 { color: #1a2b7a; border-bottom: 2px solid #d4af37; padding-bottom: 10px; margin-bottom: 20px; text-align: center; font-size: 28px; }
    h2 { color: #1a2b7a; border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 20px; font-size: 20px; }
    h3 { color: #34495e; font-size: 18px; margin-top: 15px; margin-bottom: 8px; }
    .meta-info { display: flex; justify-content: space-between; background: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 20px; font-weight: 600; flex-wrap: wrap; gap: 10px; border: 1px solid #e2e8f0; }
    .module { background: #fff; border: 1px solid #e2e8f0; padding: 20px; margin-bottom: 20px; border-radius: 8px; border-left: 4px solid #d4af37; box-shadow: 0 2px 5px rgba(0,0,0,0.02); }
    ul { padding-left: 20px; margin-top: 8px; }
    li { margin-bottom: 6px; }
    .career-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-top: 10px; }
    .career-item { background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; }
    .hero-desc { background: linear-gradient(135deg, #f0f4ff, #fdf8e8); padding: 20px; border-radius: 10px; margin-bottom: 25px; font-size: 15px; color: #555; border: 1px solid #e8e4d4; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${escapeHtml(courseName)}</h1>
    <div class="meta-info">
      <span>📂 Sector: ${escapeHtml(sector)}</span>
      <span>📊 Level: ${escapeHtml(level)}</span>
      <span>⏱️ Duration: ${escapeHtml(duration)}</span>
      ${totalHours ? `<span>🕐 Hours: ${escapeHtml(String(totalHours))}</span>` : ''}
      <span>💰 Exam Fee: ₹${examFee}</span>
    </div>
    <div class="hero-desc">${escapeHtml(heroDesc)}</div>
    ${modulesHtml}
    ${eligibilityHtml}
    ${outcomesHtml}
    ${careerHtml}
    ${assessmentHtml}
  </div>
</body>
</html>`;
}

// Main
const files = fs.readdirSync(BOOKS_DIR).filter(f => f.endsWith('.json'));
let converted = 0;
let errors = 0;

for (const file of files) {
  const slug = file.replace('.json', '');
  try {
    const raw = fs.readFileSync(path.join(BOOKS_DIR, file), 'utf-8');
    const data = JSON.parse(raw);
    const html = generateBookHtml(data, slug);
    fs.writeFileSync(path.join(OUTPUT_DIR, `${slug}.html`), html, 'utf-8');
    converted++;
  } catch (err) {
    console.error(`Error converting ${file}:`, err.message);
    errors++;
  }
}

console.log(`\n✅ Converted ${converted} book JSONs to HTML`);
if (errors > 0) console.log(`⚠ ${errors} errors`);
console.log(`Output: ${OUTPUT_DIR}`);
