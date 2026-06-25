#!/usr/bin/env node
/**
 * ============================================================
 * CETCF Book HTML Generator
 * ============================================================
 * Takes generated book JSON files and creates 225 HTML files
 * using the template_of_book.html design. Each course gets
 * its own sector-specific color theme.
 *
 * Usage:
 *   node generate-book-html.cjs          # Generate all
 *   node generate-book-html.cjs --force  # Overwrite existing
 * ============================================================
 */
'use strict';

const fs = require('fs');
const path = require('path');

// ── Paths ────────────────────────────────────────────────────
const BOOK_JSON_DIR = path.resolve(__dirname, '..', 'generated', 'books');
const BOOK_HTML_DIR = path.resolve(__dirname, '..', 'generated', 'book-html');
const TEMPLATE_PATH = path.resolve(__dirname, '..', '..', 'template_of_book.html');

// ── Sector Colors ────────────────────────────────────────────
const SECTOR_COLORS = {
  'Beauty & Lifestyle':                     { primary: '#C2185B', light: '#E91E8C', bg: 'rgba(194,24,91,.18)', border: 'rgba(194,24,91,.35)' },
  'Wellness & Alternative Therapy':         { primary: '#00897B', light: '#4DB6AC', bg: 'rgba(0,137,123,.18)', border: 'rgba(0,137,123,.35)' },
  'Digital & Information Technology':        { primary: '#1565C0', light: '#42A5F5', bg: 'rgba(21,101,192,.18)', border: 'rgba(21,101,192,.35)' },
  'Electrical & Electronics Trades':        { primary: '#F57F17', light: '#FFB300', bg: 'rgba(245,127,23,.18)', border: 'rgba(245,127,23,.35)' },
  'Construction & Building Trades':         { primary: '#5D4037', light: '#8D6E63', bg: 'rgba(93,64,55,.18)',  border: 'rgba(93,64,55,.35)' },
  'Automobile & Motor Trades':              { primary: '#C62828', light: '#EF5350', bg: 'rgba(198,40,40,.18)', border: 'rgba(198,40,40,.35)' },
  'Food, Catering & Hospitality':           { primary: '#E65100', light: '#FF8F00', bg: 'rgba(230,81,0,.18)',  border: 'rgba(230,81,0,.35)' },
  'Fashion, Tailoring & Textiles':          { primary: '#6A1B9A', light: '#AB47BC', bg: 'rgba(106,27,154,.18)', border: 'rgba(106,27,154,.35)' },
  'Agriculture & Rural Livelihood':         { primary: '#2E7D32', light: '#66BB6A', bg: 'rgba(46,125,50,.18)', border: 'rgba(46,125,50,.35)' },
  'Child Care & Domestic Services':         { primary: '#E91E63', light: '#F06292', bg: 'rgba(233,30,99,.18)', border: 'rgba(233,30,99,.35)' },
  'Education & Early Childhood':            { primary: '#283593', light: '#5C6BC0', bg: 'rgba(40,53,147,.18)', border: 'rgba(40,53,147,.35)' },
  'Media, Photography & Content Creation':  { primary: '#4527A0', light: '#7E57C2', bg: 'rgba(69,39,160,.18)', border: 'rgba(69,39,160,.35)' },
  'Spoken Languages & Communication':       { primary: '#006064', light: '#26C6DA', bg: 'rgba(0,96,100,.18)', border: 'rgba(0,96,100,.35)' },
  'Business, Retail & Finance':             { primary: '#1565C0', light: '#42A5F5', bg: 'rgba(21,101,192,.18)', border: 'rgba(21,101,192,.35)' },
  'Sports, Fitness & Recreation':           { primary: '#B71C1C', light: '#EF5350', bg: 'rgba(183,28,28,.18)', border: 'rgba(183,28,28,.35)' },
  'Handicrafts & Creative Arts':            { primary: '#795548', light: '#A1887F', bg: 'rgba(121,85,72,.18)', border: 'rgba(121,85,72,.35)' },
  'Plumbing, Sanitation & Water':           { primary: '#37474F', light: '#78909C', bg: 'rgba(55,71,79,.18)', border: 'rgba(55,71,79,.35)' },
  'Environmental & Green Skills':           { primary: '#1B5E20', light: '#4CAF50', bg: 'rgba(27,94,32,.18)', border: 'rgba(27,94,32,.35)' },
  'Religious & Spiritual Education':        { primary: '#BF360C', light: '#FF7043', bg: 'rgba(191,54,12,.18)', border: 'rgba(191,54,12,.35)' },
  'Security & Facility Management':         { primary: '#0D1B3E', light: '#546E7A', bg: 'rgba(13,27,62,.18)', border: 'rgba(13,27,62,.35)' },
  'Advanced Beauty, Cosmetology & Aesthetics': { primary: '#AD1457', light: '#EC407A', bg: 'rgba(173,20,87,.18)', border: 'rgba(173,20,87,.35)' },
  'Advanced IT, Programming & Tech Skills': { primary: '#0D47A1', light: '#1E88E5', bg: 'rgba(13,71,161,.18)', border: 'rgba(13,71,161,.35)' },
  'Apparel Design, Pattern Making & Fashion Technology': { primary: '#7B1FA2', light: '#BA68C8', bg: 'rgba(123,31,162,.18)', border: 'rgba(123,31,162,.35)' },
};

const DEFAULT_COLOR = { primary: '#B8860B', light: '#D4A017', bg: 'rgba(184,134,11,.18)', border: 'rgba(184,134,11,.35)' };

// ── Fee by level ─────────────────────────────────────────────
function examFee(level) {
  if (level === 'Advanced') return '2,000';
  if (level === 'Intermediate') return '1,500';
  return '1,000';
}

// ── Escape HTML ──────────────────────────────────────────────
function esc(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// ── Build HTML from book JSON ────────────────────────────────
function buildHTML(data) {
  const colors = SECTOR_COLORS[data.sector] || DEFAULT_COLOR;
  const fee = data.exam_fee ? `₹${Number(data.exam_fee).toLocaleString('en-IN')}` : `₹${examFee(data.level)}`;
  const durationMonths = parseInt(data.duration) || 3;
  const totalWeeks = data.total_weeks || durationMonths * 4;
  const totalHours = data.total_hours || durationMonths * 60;

  // Split course name for hero title
  const nameParts = data.course_name.split(/[&,]/, 2);
  const titleLine1 = nameParts[0].trim();
  const titleLine2 = nameParts.length > 1 ? (data.course_name.includes('&') ? '& ' : '') + nameParts[1].trim() : '';

  // ── MODULES HTML ──
  const modulesHTML = (data.modules || []).map((mod, i) => `
    <div class="module-card">
      <div class="module-head">
        <div class="mod-badge">${String(i + 1).padStart(2, '0')}</div>
        <div class="mod-info">
          <div class="mod-title">${esc(mod.title)}</div>
          <div class="mod-week">${esc(mod.week_range)} &nbsp;|&nbsp; <span class="mod-hrs">${mod.hours || 30} Hours</span></div>
        </div>
      </div>
      <div class="module-body">
        <ul class="topic-list">
          ${(mod.topics || []).map(t => `<li>${esc(t)}</li>`).join('\n          ')}
        </ul>
      </div>
    </div>`).join('\n');

  // ── ASSESSMENT HTML ──
  const assess = data.assessment || {};
  const practicalItems = (assess.practical_items || []).map((item, i) => `
    <div style="background:var(--white);border:1px solid var(--border);border-radius:12px;padding:18px 22px;display:flex;align-items:center;gap:18px;">
      <div style="width:40px;height:40px;border-radius:50%;background:var(--navy);color:var(--gold-l);font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${i + 1}</div>
      <div style="flex:1">
        <div style="font-size:14px;font-weight:600;color:var(--navy);">${esc(item.title)}</div>
        <div style="font-size:12px;color:var(--muted);margin-top:3px;">${esc(item.description)}</div>
      </div>
      <div style="font-size:18px;font-weight:700;color:var(--success);flex-shrink:0;">${item.marks} Marks</div>
    </div>`).join('\n');

  // ── ELIGIBILITY HTML ──
  const eligibilityHTML = (data.eligibility || []).map(e =>
    `<li><span class="ck rose">✓</span> ${esc(e)}</li>`
  ).join('\n        ');

  // ── OUTCOMES HTML ──
  const outcomesHTML = (data.learning_outcomes || []).map(o =>
    `<li><span class="ck gold">✓</span> ${esc(o)}</li>`
  ).join('\n        ');

  // ── CAREER PATHS HTML ──
  const careerHTML = (data.career_paths || []).map(c => `
    <div class="career-card">
      <div class="career-icon">${c.icon || '💼'}</div>
      <div class="career-info">
        <div class="career-title">${esc(c.title)}</div>
        <div class="career-type">${esc(c.type)}${c.salary ? ' — ₹' + c.salary : ''}</div>
      </div>
    </div>`).join('\n');

  // ── FULL HTML ──
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(data.course_name)} — CETCF Syllabus</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --ink:     #1A1025;
    --navy:    #0D1B3E;
    --gold:    #B8860B;
    --gold-l:  #D4A017;
    --rose:    ${colors.primary};
    --rose-l:  ${colors.light};
    --cream:   #FDF8F2;
    --warm:    #FAF3EA;
    --border:  #EDE0D0;
    --muted:   #7A6A5A;
    --white:   #FFFFFF;
    --success: #1B7A4A;
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }

  body {
    font-family: 'DM Sans', sans-serif;
    background: var(--cream);
    color: var(--ink);
    line-height: 1.6;
  }

  /* ── HERO BAND ── */
  .hero {
    background: var(--navy);
    padding: 0;
    position: relative;
    overflow: hidden;
  }
  .hero-inner {
    max-width: 1100px;
    margin: 0 auto;
    padding: 56px 32px 48px;
    display: flex;
    gap: 48px;
    align-items: center;
    position: relative;
    z-index: 2;
  }
  .hero::before {
    content: '';
    position: absolute;
    right: -60px; top: -60px;
    width: 400px; height: 400px;
    background: radial-gradient(circle, ${colors.bg} 0%, transparent 70%);
    pointer-events: none;
  }
  .hero::after {
    content: '';
    position: absolute;
    left: 30%; bottom: -40px;
    width: 300px; height: 300px;
    background: radial-gradient(circle, rgba(184,134,11,.12) 0%, transparent 70%);
    pointer-events: none;
  }
  .hero-left { flex: 1; }
  .hero-eyebrow {
    display: inline-flex; align-items: center; gap: 8px;
    background: ${colors.bg};
    border: 1px solid ${colors.border};
    color: ${colors.light};
    font-size: 11px; font-weight: 600;
    letter-spacing: .1em; text-transform: uppercase;
    padding: 5px 14px; border-radius: 20px;
    margin-bottom: 18px;
  }
  .hero h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(28px, 4vw, 48px);
    font-weight: 700;
    color: var(--white);
    line-height: 1.15;
    margin-bottom: 14px;
  }
  .hero h1 span { color: ${colors.light}; }
  .hero-sub {
    font-size: 15px;
    color: rgba(255,255,255,.65);
    max-width: 480px;
    line-height: 1.7;
    margin-bottom: 28px;
  }
  .hero-tags { display: flex; gap: 10px; flex-wrap: wrap; }
  .hero-tag {
    font-size: 12px; font-weight: 500;
    padding: 6px 14px; border-radius: 6px;
    border: 1px solid rgba(255,255,255,.15);
    color: rgba(255,255,255,.8);
    display: flex; align-items: center; gap: 6px;
  }
  .hero-tag.gold { border-color: ${colors.border}; color: ${colors.light}; background: ${colors.bg}; }
  .hero-right { flex-shrink: 0; }
  .hero-stat-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    width: 240px;
  }
  .hstat {
    background: rgba(255,255,255,.06);
    border: 1px solid rgba(255,255,255,.1);
    border-radius: 10px;
    padding: 14px 16px;
    text-align: center;
  }
  .hstat .v { font-size: 22px; font-weight: 700; color: ${colors.light}; }
  .hstat .l { font-size: 10px; color: rgba(255,255,255,.5); margin-top: 2px; letter-spacing:.04em; text-transform:uppercase; }

  /* ── GOLD RULE ── */
  .gold-rule { height: 3px; background: linear-gradient(90deg, ${colors.primary}, var(--gold), ${colors.primary}); }

  /* ── WRAPPER ── */
  .wrap { max-width: 1100px; margin: 0 auto; padding: 0 32px; }

  /* ── SECTION SPACING ── */
  .section { padding: 56px 0; }
  .section + .section { border-top: 1px solid var(--border); }

  /* ── SECTION LABEL ── */
  .sec-label {
    font-size: 10px; font-weight: 700;
    letter-spacing: .14em; text-transform: uppercase;
    color: ${colors.primary}; margin-bottom: 6px;
  }
  .sec-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(20px, 2.5vw, 28px);
    font-weight: 600;
    color: var(--navy);
    margin-bottom: 8px;
  }
  .sec-sub { font-size: 14px; color: var(--muted); line-height: 1.7; max-width: 620px; }

  /* ── OVERVIEW CARDS ── */
  .overview-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-top: 32px; }
  .ov-card { background: var(--white); border: 1px solid var(--border); border-radius: 12px; padding: 20px 16px; text-align: center; }
  .ov-card .icon { font-size: 26px; margin-bottom: 10px; }
  .ov-card .val { font-size: 18px; font-weight: 700; color: var(--navy); }
  .ov-card .key { font-size: 11px; color: var(--muted); margin-top: 3px; text-transform: uppercase; letter-spacing: .04em; }

  /* ── MODULES ── */
  .modules-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; margin-top: 32px; }
  .module-card { background: var(--white); border: 1px solid var(--border); border-radius: 14px; overflow: hidden; }
  .module-head { padding: 18px 20px; display: flex; align-items: center; gap: 14px; border-bottom: 1px solid var(--border); background: var(--warm); }
  .mod-badge { width: 36px; height: 36px; border-radius: 50%; background: var(--navy); color: ${colors.light}; font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .mod-info { flex: 1; min-width: 0; }
  .mod-title { font-size: 14px; font-weight: 600; color: var(--navy); }
  .mod-week { font-size: 11px; color: var(--muted); margin-top: 2px; }
  .mod-hrs { font-size: 11px; font-weight: 600; color: ${colors.primary}; }
  .module-body { padding: 16px 20px; }
  .topic-list { list-style: none; }
  .topic-list li { font-size: 13px; color: var(--ink); padding: 5px 0; border-bottom: 1px solid #F5EFE8; display: flex; align-items: flex-start; gap: 8px; line-height: 1.4; }
  .topic-list li:last-child { border-bottom: none; }
  .topic-list li::before { content: '◆'; font-size: 6px; color: ${colors.primary}; margin-top: 5px; flex-shrink: 0; }

  /* ── ASSESSMENT TABLE ── */
  .assess-table { width: 100%; border-collapse: collapse; margin-top: 28px; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 16px rgba(0,0,0,.05); }
  .assess-table thead tr { background: var(--navy); }
  .assess-table thead th { padding: 14px 18px; text-align: left; font-size: 12px; font-weight: 600; color: ${colors.light}; letter-spacing: .04em; text-transform: uppercase; }
  .assess-table tbody tr { background: var(--white); border-bottom: 1px solid var(--border); transition: background .15s; }
  .assess-table tbody tr:hover { background: var(--warm); }
  .assess-table tbody tr:last-child { border-bottom: none; }
  .assess-table td { padding: 13px 18px; font-size: 14px; color: var(--ink); }
  .assess-table td:first-child { font-weight: 500; }
  .mark-badge { display: inline-block; font-size: 12px; font-weight: 700; padding: 3px 10px; border-radius: 20px; }
  .mark-theory { background: #E8EDFF; color: #1A2B7A; }
  .mark-practical { background: #E8F8F0; color: var(--success); }
  .mark-total { background: var(--navy); color: ${colors.light}; }
  .pass-chip { display: inline-flex; align-items: center; gap: 5px; background: #E8F8F0; color: var(--success); font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px; border: 1px solid #C0E8D0; }

  /* ── ELIGIBILITY & OUTCOMES ── */
  .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 28px; }
  .info-block { background: var(--white); border: 1px solid var(--border); border-radius: 14px; padding: 24px; }
  .info-block h4 { font-size: 13px; font-weight: 700; color: var(--navy); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 16px; padding-bottom: 10px; border-bottom: 2px solid ${colors.primary}; display: inline-block; }
  .check-list { list-style: none; }
  .check-list li { font-size: 13px; color: var(--ink); padding: 6px 0; display: flex; align-items: flex-start; gap: 10px; line-height: 1.5; }
  .check-list li .ck { width: 18px; height: 18px; border-radius: 50%; color: white; font-size: 9px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 1px; }
  .check-list li .ck.rose { background: ${colors.primary}; }
  .check-list li .ck.gold { background: var(--gold); }

  /* ── CAREER PATH ── */
  .career-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; margin-top: 28px; }
  .career-card { background: var(--white); border: 1px solid var(--border); border-radius: 12px; padding: 18px 16px; display: flex; align-items: flex-start; gap: 12px; }
  .career-icon { font-size: 24px; flex-shrink: 0; }
  .career-info { flex: 1; }
  .career-title { font-size: 13px; font-weight: 600; color: var(--navy); margin-bottom: 3px; }
  .career-type { font-size: 11px; color: var(--muted); }

  /* ── EXAM MODE ── */
  .exam-modes { display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; margin-top: 28px; }
  .exam-mode-card { background: var(--white); border: 1px solid var(--border); border-radius: 14px; padding: 22px 20px; text-align: center; position: relative; overflow: hidden; }
  .exam-mode-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; }
  .exam-mode-card.theory::before { background: linear-gradient(90deg, #1A2B7A, #4A6BCA); }
  .exam-mode-card.practical::before { background: linear-gradient(90deg, var(--success), #4ABCA0); }
  .em-icon { font-size: 32px; margin-bottom: 12px; }
  .em-title { font-size: 14px; font-weight: 700; color: var(--navy); margin-bottom: 6px; }
  .em-marks { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
  .theory .em-marks { color: #1A2B7A; }
  .practical .em-marks { color: var(--success); }
  .em-desc { font-size: 12px; color: var(--muted); line-height: 1.6; }

  /* ── PATHWAY BANNER ── */
  .pathway-banner { background: linear-gradient(135deg, var(--navy) 0%, #162347 100%); border-radius: 16px; padding: 36px 40px; margin-top: 28px; display: flex; justify-content: space-between; align-items: center; gap: 24px; }
  .pb-left h3 { font-family: 'Playfair Display', serif; font-size: 22px; color: var(--white); margin-bottom: 8px; }
  .pb-left p { font-size: 13px; color: rgba(255,255,255,.6); line-height: 1.6; max-width: 420px; }
  .pb-btns { display: flex; gap: 10px; flex-shrink: 0; flex-wrap: wrap; }
  .btn-p { padding: 11px 22px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none; border: none; cursor: pointer; transition: all .2s; }
  .btn-gold { background: var(--gold); color: var(--navy); }
  .btn-gold:hover { background: var(--gold-l); }
  .btn-outline { border: 1.5px solid rgba(255,255,255,.3); color: var(--white); background: transparent; }
  .btn-outline:hover { border-color: var(--gold); color: var(--gold-l); }

  /* ── CERT PREVIEW ── */
  .cert-preview { background: linear-gradient(135deg, #FFFEF7, #FFF9E6); border: 2px solid var(--gold); border-radius: 14px; padding: 28px 32px; margin-top: 28px; text-align: center; position: relative; }
  .cert-preview::before { content: ''; position: absolute; inset: 6px; border: 1px solid rgba(184,134,11,.2); border-radius: 10px; pointer-events: none; }
  .cert-org { font-size: 14px; font-weight: 700; color: var(--navy); }
  .cert-tag { font-size: 10px; color: var(--muted); margin-top: 2px; }
  .cert-title { font-family: 'Playfair Display', serif; font-size: 26px; color: var(--navy); margin: 12px 0; }
  .cert-name-line { font-size: 13px; color: var(--muted); }
  .cert-name { display: block; font-size: 20px; font-weight: 700; color: var(--gold); margin: 8px 0; padding-bottom: 6px; border-bottom: 2px solid var(--gold); max-width: 320px; margin-left: auto; margin-right: auto; }
  .cert-course { font-size: 15px; font-weight: 700; color: var(--navy); margin: 10px 0; }
  .cert-badges-row { display: flex; justify-content: center; gap: 14px; flex-wrap: wrap; margin-top: 20px; }
  .cert-badge-sm { font-size: 10px; font-weight: 600; padding: 4px 10px; border: 1.5px solid var(--border); border-radius: 4px; color: var(--muted); }

  /* ── FOOTER ── */
  .page-footer { background: var(--navy); color: rgba(255,255,255,.5); text-align: center; padding: 20px 32px; font-size: 12px; }
  .page-footer strong { color: ${colors.light}; }

  /* ── RESPONSIVE ── */
  @media (max-width: 768px) {
    .hero-inner { flex-direction: column; padding: 36px 20px; }
    .hero-stat-grid { width: 100%; }
    .modules-grid { grid-template-columns: 1fr; }
    .two-col { grid-template-columns: 1fr; }
    .exam-modes { grid-template-columns: 1fr; }
    .pathway-banner { flex-direction: column; padding: 28px 24px; }
    .wrap { padding: 0 20px; }
  }

  @media print {
    .pathway-banner, .pb-btns { display: none; }
    body { background: white; }
  }
</style>
</head>
<body>

<!-- HERO -->
<div class="hero">
  <div class="hero-inner">
    <div class="hero-left">
      <div class="hero-eyebrow">
        <span>✦</span> CETCF Certified Program
      </div>
      <h1>${esc(titleLine1)}${titleLine2 ? '<br><span>' + esc(titleLine2) + '</span>' : ''}</h1>
      <p class="hero-sub">${esc(data.hero_description || data.overview_description || '')}</p>
      <div class="hero-tags">
        <div class="hero-tag gold">🏷️ Sector: ${esc(data.sector)}</div>
        <div class="hero-tag">🔄 Course + RPL Pathway + Certification</div>
      </div>
    </div>
    <div class="hero-right">
      <div class="hero-stat-grid">
        <div class="hstat"><div class="v">${assess.total_marks || 100}</div><div class="l">Total Marks</div></div>
        <div class="hstat"><div class="v">${assess.pass_percentage || 50}%</div><div class="l">Pass Mark</div></div>
        <div class="hstat"><div class="v">${totalWeeks}</div><div class="l">Weeks</div></div>
        <div class="hstat"><div class="v">${fee}</div><div class="l">Exam Fee</div></div>
      </div>
    </div>
  </div>
</div>
<div class="gold-rule"></div>

<!-- OVERVIEW -->
<div class="wrap">
<section class="section">
  <div class="sec-label">Course Overview</div>
  <div class="sec-title">What this program covers</div>
  <p class="sec-sub">${esc(data.overview_description || '')}</p>

  <div class="overview-grid">
    <div class="ov-card"><div class="icon">🗓️</div><div class="val">${esc(data.duration)}</div><div class="key">Duration</div></div>
    <div class="ov-card"><div class="icon">📚</div><div class="val">${(data.modules || []).length} Units</div><div class="key">Modules</div></div>
    <div class="ov-card"><div class="icon">⏱️</div><div class="val">${totalHours} Hrs</div><div class="key">Total Contact Hours</div></div>
    <div class="ov-card"><div class="icon">💻</div><div class="val">Online</div><div class="key">Exam Mode</div></div>
    <div class="ov-card"><div class="icon">🔄</div><div class="val">Dual</div><div class="key">Training + RPL</div></div>
  </div>
</section>

<!-- MODULES / SYLLABUS -->
<section class="section">
  <div class="sec-label">Detailed Syllabus</div>
  <div class="sec-title">Module-by-Module Breakdown</div>
  <p class="sec-sub">Each module is designed to be practical-first. Theory gives the foundation; practical sessions build the real skill.</p>

  <div class="modules-grid">
${modulesHTML}
  </div>
</section>

<!-- ASSESSMENT -->
<section class="section">
  <div class="sec-label">Assessment &amp; Marking</div>
  <div class="sec-title">Exam Structure</div>
  <p class="sec-sub">The exam is fully automated. All components are completed online via the CETCF portal.</p>

  <div class="exam-modes">
    <div class="exam-mode-card theory">
      <div class="em-icon">📝</div>
      <div class="em-title">Theory — MCQ</div>
      <div class="em-marks">${assess.theory_marks || 50} Marks</div>
      <div class="em-desc">${esc(assess.theory_format || '25 Questions × 2 Marks')}. ${esc(assess.theory_duration || '45 minutes')} timer. Auto-scored instantly on submission.</div>
    </div>
    <div class="exam-mode-card practical">
      <div class="em-icon">📸</div>
      <div class="em-title">Practical — Portfolio Upload</div>
      <div class="em-marks">${assess.practical_marks || 50} Marks</div>
      <div class="em-desc">${esc(assess.practical_format || 'Upload evidence items via CETCF Portal.')}</div>
    </div>
  </div>

  <table class="assess-table">
    <thead><tr><th>Component</th><th>Marks</th><th>Format</th><th>Mode</th><th>Pass Requirement</th></tr></thead>
    <tbody>
      <tr>
        <td>Theory (MCQ)</td>
        <td><span class="mark-badge mark-theory">${assess.theory_marks || 50} Marks</span></td>
        <td>${esc(assess.theory_format || '25 Questions × 2 Marks')}</td>
        <td>Online Portal — Auto Timer</td>
        <td>Minimum ${Math.round((assess.theory_marks || 50) * (assess.pass_percentage || 50) / 100)}/${assess.theory_marks || 50} (${assess.pass_percentage || 50}%)</td>
      </tr>
      <tr>
        <td>Practical Assessment</td>
        <td><span class="mark-badge mark-practical">${assess.practical_marks || 50} Marks</span></td>
        <td>${esc(assess.practical_format || 'Evidence Uploads')}</td>
        <td>Upload via CETCF Portal</td>
        <td>Minimum ${Math.round((assess.practical_marks || 50) * (assess.pass_percentage || 50) / 100)}/${assess.practical_marks || 50} (${assess.pass_percentage || 50}%)</td>
      </tr>
      <tr style="background:#FAFAFA; font-weight:600">
        <td><strong>Total</strong></td>
        <td><span class="mark-badge mark-total">${assess.total_marks || 100} Marks</span></td>
        <td>—</td>
        <td>All Online</td>
        <td><span class="pass-chip">✓ ${Math.round((assess.total_marks || 100) * (assess.pass_percentage || 50) / 100)} / ${assess.total_marks || 100} to Pass</span></td>
      </tr>
    </tbody>
  </table>
</section>

${practicalItems ? `
<!-- PRACTICAL EVIDENCE REQUIRED -->
<section class="section">
  <div class="sec-label">Practical Submission</div>
  <div class="sec-title">What to Upload for Practical Assessment</div>
  <p class="sec-sub">Upload the following evidence items through the CETCF candidate portal.</p>
  <div style="margin-top:28px; display:flex; flex-direction:column; gap:10px;">
${practicalItems}
  </div>
</section>
` : ''}

<!-- ELIGIBILITY + OUTCOMES -->
<section class="section">
  <div class="sec-label">Who Can Enrol &amp; What You'll Achieve</div>
  <div class="sec-title">Eligibility &amp; Learning Outcomes</div>

  <div class="two-col">
    <div class="info-block">
      <h4>Eligibility Criteria</h4>
      <ul class="check-list">
        ${eligibilityHTML}
      </ul>
    </div>
    <div class="info-block">
      <h4>Learning Outcomes</h4>
      <ul class="check-list">
        ${outcomesHTML}
      </ul>
    </div>
  </div>
</section>

<!-- CAREER PATHS -->
<section class="section">
  <div class="sec-label">After Certification</div>
  <div class="sec-title">Career &amp; Self-Employment Paths</div>
  <p class="sec-sub">A CETCF ${esc(data.course_name)} certificate opens doors across employment, freelance, and self-employment avenues.</p>

  <div class="career-grid">
${careerHTML}
  </div>
</section>

<!-- CERT PREVIEW -->
<section class="section">
  <div class="sec-label">Certification</div>
  <div class="sec-title">Certificate You Will Receive</div>
  <p class="sec-sub">On passing all exam components, your CETCF certificate is issued with a unique Certificate ID and QR verification code.</p>

  <div style="display:flex; justify-content:center; margin-top:28px;">
    <div style="max-width:620px; width:100%;">
      <div class="cert-preview">
        <div class="cert-org">Council for Education, Training & Certification Foundation</div>
        <div class="cert-tag">ISO 9001:2015 Certified · Section 8 Company (Govt. of India) · Lic. 181729</div>
        <div class="cert-title">Certificate of Completion</div>
        <div class="cert-name-line">This is to certify that</div>
        <span class="cert-name">[Candidate Name]</span>
        <div class="cert-course">has successfully completed the certified program in<br><strong>${esc(data.course_name)}</strong></div>
        <div class="cert-badges-row">
          <span class="cert-badge-sm">🆔 CETC/2025/${esc(data.sector ? data.sector.split(' ')[0].toUpperCase() : 'CERT')}/XXXXXX</span>
          <span class="cert-badge-sm">📱 QR Verified</span>
          <span class="cert-badge-sm">🌐 cetcf.org/verify</span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- PATHWAY BANNER -->
<section class="section">
  <div class="pathway-banner">
    <div class="pb-left">
      <h3>Ready to Get Certified?</h3>
      <p>Choose your pathway — study online with our video course, or if you're already skilled, take the RPL exam directly. Either way, your ${esc(data.course_name)} certificate is just an exam away.</p>
    </div>
    <div class="pb-btns">
      <a href="#" class="btn-p btn-gold">Start Learning</a>
      <a href="#" class="btn-p btn-outline">Take RPL Exam</a>
    </div>
  </div>
</section>

</div><!-- .wrap -->

<!-- FOOTER -->
<div class="page-footer">
  © 2025 <strong>CETCF</strong> — Council for Education, Training & Certification Foundation. All rights reserved.
</div>

</body>
</html>`;
}

// ── Main ─────────────────────────────────────────────────────
function main() {
  const force = process.argv.includes('--force');

  if (!fs.existsSync(BOOK_JSON_DIR)) {
    console.error('❌ No book JSON directory found. Run generate-content.cjs first.');
    process.exit(1);
  }

  if (!fs.existsSync(BOOK_HTML_DIR)) {
    fs.mkdirSync(BOOK_HTML_DIR, { recursive: true });
  }

  const files = fs.readdirSync(BOOK_JSON_DIR).filter(f => f.endsWith('.json'));
  console.log(`\n📚 Found ${files.length} book JSON files`);
  console.log(`📁 Output: ${BOOK_HTML_DIR}\n`);

  let generated = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of files) {
    const slug = file.replace('.json', '');
    const htmlFile = path.join(BOOK_HTML_DIR, `${slug}.html`);

    if (!force && fs.existsSync(htmlFile)) {
      skipped++;
      continue;
    }

    try {
      const data = JSON.parse(fs.readFileSync(path.join(BOOK_JSON_DIR, file), 'utf-8'));
      const html = buildHTML(data);
      fs.writeFileSync(htmlFile, html, 'utf-8');
      generated++;
      console.log(`  ✅ ${slug}.html (${data.sector})`);
    } catch (err) {
      errors++;
      console.error(`  ❌ ${slug}: ${err.message}`);
    }
  }

  console.log(`\n${'═'.repeat(50)}`);
  console.log(`✨ HTML Generation Complete`);
  console.log(`   Generated: ${generated}`);
  console.log(`   Skipped (existing): ${skipped}`);
  console.log(`   Errors: ${errors}`);
  console.log(`${'═'.repeat(50)}\n`);
}

main();
