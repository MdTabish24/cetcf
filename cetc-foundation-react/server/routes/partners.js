'use strict';
/**
 * Partner (AAC) Routes
 * POST /api/partners/register
 * POST /api/partners/login
 * GET  /api/partners/dashboard
 * GET  /api/partners/batches
 * POST /api/partners/batches
 * POST /api/partners/enroll
 * POST /api/partners/bulk-enroll
 * GET  /api/partners/earnings
 * GET  /api/partners/reports
 * GET  /api/partners/branding
 */
const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const bcrypt = require('bcryptjs');
const path = require('path');
const router = express.Router();
const db = require('../db');
const { authenticate, requirePartner, requireAdmin } = require('../middleware/auth');
const { validatePartnerRegister } = require('../middleware/validation');
const { notifyPartnerApproval, notifyRegistration } = require('../services/notification');
const { generateToken } = require('../middleware/auth');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!['.xlsx', '.xls', '.csv'].includes(ext)) {
      return cb(new Error('Only Excel/CSV files are allowed.'), false);
    }
    cb(null, true);
  },
});

/**
 * POST /api/partners/register
 * New partner application (public)
 */
router.post('/register', validatePartnerRegister, async (req, res) => {
  const { org_name, org_type, contact_name, mobile, email, state, district, address, interested_trades, expected_monthly_students, password } = req.body;

  try {
    // Check if mobile already registered
    const existing = await db.query('SELECT * FROM partners WHERE mobile = $1', [mobile]);
    if (existing.rows.length) {
      return res.status(409).json({ success: false, message: 'A partner with this mobile number already exists.' });
    }

    // Create or find user
    let user = (await db.query('SELECT * FROM users WHERE mobile = $1', [mobile])).rows[0];
    if (!user) {
      user = (await db.query(
        'INSERT INTO users (mobile, name, email, role) VALUES ($1, $2, $3, $4) RETURNING *',
        [mobile, contact_name, email, 'partner']
      )).rows[0];
    }

    // Hash password
    const passwordHash = password ? await bcrypt.hash(password, 10) : null;

    const result = await db.query(
      `INSERT INTO partners (user_id, org_name, org_type, contact_name, mobile, email, state, district, address, interested_trades, expected_monthly_students, password_hash, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'pending') RETURNING id, org_name, contact_name, status`,
      [user.id, org_name, org_type, contact_name, mobile, email, state, district, address, interested_trades || [], expected_monthly_students, passwordHash]
    );

    // Notify applicant
    notifyRegistration(mobile, email, contact_name).catch(console.warn);

    return res.status(201).json({
      success: true,
      message: 'Partner application submitted! You will be notified within 2-3 business days.',
      partner: result.rows[0],
    });
  } catch (err) {
    console.error('[Partners] register error:', err);
    return res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
});

/**
 * GET /api/partners/dashboard
 * Partner dashboard: overview stats
 */
router.get('/dashboard', ...requirePartner, async (req, res) => {
  const partnerId = req.user.partnerId;
  try {
    // Total candidates enrolled via this partner
    const candidateStats = await db.query(
      `SELECT 
        COUNT(DISTINCT c.id) as total_candidates,
        COUNT(CASE WHEN c.status = 'passed' THEN 1 END) as passed,
        COUNT(CASE WHEN c.status = 'failed' THEN 1 END) as failed,
        COUNT(CASE WHEN c.status = 'enrolled' THEN 1 END) as pending_exam
       FROM batches b
       JOIN LATERAL UNNEST(b.candidate_ids) AS cid(candidate_id) ON TRUE
       JOIN candidates c ON c.id = cid.candidate_id
       WHERE b.partner_id = $1`,
      [partnerId]
    );

    // Earnings summary
    const earnings = await db.query(
      `SELECT COALESCE(SUM(amount), 0) as total, COALESCE(SUM(CASE WHEN is_paid = false THEN amount END), 0) as pending
       FROM commissions WHERE partner_id = $1`,
      [partnerId]
    );

    // Recent batches
    const recentBatches = await db.query(
      `SELECT b.*, t.name as trade_name, ARRAY_LENGTH(b.candidate_ids, 1) as candidate_count
       FROM batches b JOIN trades t ON b.trade_id = t.id
       WHERE b.partner_id = $1 ORDER BY b.created_at DESC LIMIT 5`,
      [partnerId]
    );

    const stats = candidateStats.rows[0];
    const earn = earnings.rows[0];

    return res.json({
      success: true,
      dashboard: {
        totalCandidates: parseInt(stats.total_candidates) || 0,
        passedCandidates: parseInt(stats.passed) || 0,
        failedCandidates: parseInt(stats.failed) || 0,
        pendingExam: parseInt(stats.pending_exam) || 0,
        totalEarnings: parseInt(earn.total) || 0,
        pendingEarnings: parseInt(earn.pending) || 0,
        recentBatches: recentBatches.rows,
      },
    });
  } catch (err) {
    console.error('[Partners] dashboard error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch dashboard.' });
  }
});

/**
 * POST /api/partners/enroll
 * Single candidate enrollment by partner
 */
router.post('/enroll', ...requirePartner, async (req, res) => {
  const { name, mobile, email, trade_id, dob, address } = req.body;

  if (!name || !mobile || !trade_id) {
    return res.status(400).json({ success: false, message: 'Name, mobile, and trade are required.' });
  }

  if (!/^[6-9]\d{9}$/.test(mobile)) {
    return res.status(400).json({ success: false, message: 'Invalid mobile number.' });
  }

  try {
    // Find or create user
    let user = (await db.query('SELECT * FROM users WHERE mobile = $1', [mobile])).rows[0];
    if (!user) {
      user = (await db.query(
        'INSERT INTO users (mobile, name, email, dob, address, role) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [mobile, name, email || null, dob || null, address || null, 'candidate']
      )).rows[0];
    }

    // Check if already enrolled
    const existing = await db.query(
      'SELECT c.id FROM candidates c WHERE c.user_id = $1 AND c.trade_id = $2',
      [user.id, trade_id]
    );

    let candidate;
    if (existing.rows.length) {
      candidate = existing.rows[0];
    } else {
      candidate = (await db.query(
        "INSERT INTO candidates (user_id, trade_id, status) VALUES ($1, $2, 'enrolled') RETURNING *",
        [user.id, trade_id]
      )).rows[0];
    }

    return res.status(201).json({ success: true, candidate: { ...candidate, name: user.name, mobile: user.mobile } });
  } catch (err) {
    console.error('[Partners] enroll error:', err);
    return res.status(500).json({ success: false, message: 'Enrollment failed.' });
  }
});

/**
 * POST /api/partners/bulk-enroll
 * Excel bulk enrollment — parse, validate, and enroll candidates
 */
router.post('/bulk-enroll', ...requirePartner, upload.single('excel'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Excel file is required.' });
  }

  const { trade_id } = req.body;
  if (!trade_id) {
    return res.status(400).json({ success: false, message: 'Trade ID is required.' });
  }

  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (!rows.length) {
      return res.status(400).json({ success: false, message: 'Excel file is empty.' });
    }

    const results = { success: [], errors: [], duplicates: [] };
    const seenMobiles = new Set();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2; // Excel row number (1 = header)

      const name = String(row['Name'] || row['name'] || row['Full Name'] || '').trim();
      const mobile = String(row['Mobile'] || row['mobile'] || row['Phone'] || '').trim().replace(/\D/g, '').slice(-10);
      const email = String(row['Email'] || row['email'] || '').trim();
      const dob = row['DOB'] || row['Date of Birth'] || null;

      // Validate
      if (!name) { results.errors.push({ row: rowNum, mobile, issue: 'Name is missing' }); continue; }
      if (!/^[6-9]\d{9}$/.test(mobile)) { results.errors.push({ row: rowNum, mobile, issue: 'Invalid mobile number' }); continue; }

      // Check in-file duplicates
      if (seenMobiles.has(mobile)) { results.duplicates.push({ row: rowNum, mobile, issue: 'Duplicate in this file' }); continue; }
      seenMobiles.add(mobile);

      try {
        let user = (await db.query('SELECT * FROM users WHERE mobile = $1', [mobile])).rows[0];
        if (!user) {
          user = (await db.query(
            'INSERT INTO users (mobile, name, email, role) VALUES ($1, $2, $3, $4) RETURNING *',
            [mobile, name, email || null, 'candidate']
          )).rows[0];
        }

        const existing = await db.query('SELECT id FROM candidates WHERE user_id = $1 AND trade_id = $2', [user.id, trade_id]);
        if (existing.rows.length) {
          results.duplicates.push({ row: rowNum, mobile, name, issue: 'Already enrolled in this trade' });
          continue;
        }

        const candidate = (await db.query(
          "INSERT INTO candidates (user_id, trade_id, status) VALUES ($1, $2, 'enrolled') RETURNING id",
          [user.id, trade_id]
        )).rows[0];

        results.success.push({ row: rowNum, mobile, name, candidateId: candidate.id });
      } catch (rowErr) {
        results.errors.push({ row: rowNum, mobile, name, issue: rowErr.message });
      }
    }

    return res.json({
      success: true,
      summary: {
        total: rows.length,
        enrolled: results.success.length,
        errors: results.errors.length,
        duplicates: results.duplicates.length,
      },
      details: results,
    });
  } catch (err) {
    console.error('[Partners] bulk-enroll error:', err);
    return res.status(500).json({ success: false, message: 'Failed to process Excel file.' });
  }
});

/**
 * GET /api/partners/batches
 * List partner batches
 */
router.get('/batches', ...requirePartner, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT b.*, t.name as trade_name, ARRAY_LENGTH(b.candidate_ids, 1) as candidate_count
       FROM batches b JOIN trades t ON b.trade_id = t.id
       WHERE b.partner_id = $1 ORDER BY b.created_at DESC`,
      [req.user.partnerId]
    );
    return res.json({ success: true, batches: result.rows });
  } catch (err) {
    console.error('[Partners] batches error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch batches.' });
  }
});

/**
 * POST /api/partners/batches
 * Create a new batch
 */
router.post('/batches', ...requirePartner, async (req, res) => {
  const { batch_name, trade_id, candidate_ids, exam_date } = req.body;

  if (!trade_id || !Array.isArray(candidate_ids) || !candidate_ids.length) {
    return res.status(400).json({ success: false, message: 'Trade and candidate list are required.' });
  }

  try {
    const result = await db.query(
      `INSERT INTO batches (partner_id, trade_id, batch_name, candidate_ids, exam_date, status)
       VALUES ($1, $2, $3, $4, $5, 'active') RETURNING *`,
      [req.user.partnerId, trade_id, batch_name, candidate_ids, exam_date]
    );
    return res.status(201).json({ success: true, batch: result.rows[0] });
  } catch (err) {
    console.error('[Partners] create batch error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create batch.' });
  }
});

/**
 * GET /api/partners/earnings
 * Commission tracker
 */
router.get('/earnings', ...requirePartner, async (req, res) => {
  try {
    const commissions = await db.query(
      `SELECT * FROM commissions WHERE partner_id = $1 ORDER BY created_at DESC`,
      [req.user.partnerId]
    );

    const summary = await db.query(
      `SELECT 
        COALESCE(SUM(amount), 0) as total_earned,
        COALESCE(SUM(CASE WHEN is_paid = false THEN amount END), 0) as pending,
        COALESCE(SUM(CASE WHEN is_paid = true THEN amount END), 0) as paid
       FROM commissions WHERE partner_id = $1`,
      [req.user.partnerId]
    );

    return res.json({ success: true, commissions: commissions.rows, summary: summary.rows[0] });
  } catch (err) {
    console.error('[Partners] earnings error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch earnings.' });
  }
});

/**
 * GET /api/partners/reports
 * Download partner report (JSON, can be exported to Excel via frontend)
 */
router.get('/reports', ...requirePartner, async (req, res) => {
  const { format } = req.query; // json or excel
  try {
    const result = await db.query(
      `SELECT 
        u.name, u.mobile, t.name as trade_name, c.status, c.enrollment_date,
        c.attempts_used,
        (SELECT e.score FROM exams e WHERE e.candidate_id = c.id ORDER BY e.created_at DESC LIMIT 1) as last_score,
        (SELECT cert.cert_number FROM certificates cert WHERE cert.candidate_id = c.id LIMIT 1) as cert_number
       FROM batches b
       JOIN LATERAL UNNEST(b.candidate_ids) AS cid(candidate_id) ON TRUE
       JOIN candidates c ON c.id = cid.candidate_id
       JOIN users u ON c.user_id = u.id
       JOIN trades t ON c.trade_id = t.id
       WHERE b.partner_id = $1
       ORDER BY c.enrollment_date DESC`,
      [req.user.partnerId]
    );

    if (format === 'excel') {
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(result.rows);
      XLSX.utils.book_append_sheet(wb, ws, 'Report');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      res.setHeader('Content-Disposition', 'attachment; filename="cetcf_report.xlsx"');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      return res.send(buffer);
    }

    return res.json({ success: true, data: result.rows, count: result.rows.length });
  } catch (err) {
    console.error('[Partners] reports error:', err);
    return res.status(500).json({ success: false, message: 'Failed to generate report.' });
  }
});

/**
 * GET /api/partners/branding
 * Branding kit download links
 */
router.get('/branding', ...requirePartner, async (req, res) => {
  return res.json({
    success: true,
    brandingKit: {
      logoHighRes: `${process.env.CERT_BASE_URL || 'http://localhost:5000'}/uploads/branding/cetcf_logo_hires.png`,
      logoSVG: `${process.env.CERT_BASE_URL || 'http://localhost:5000'}/uploads/branding/cetcf_logo.svg`,
      bannerHorizontal: `${process.env.CERT_BASE_URL || 'http://localhost:5000'}/uploads/branding/banner_horizontal.jpg`,
      bannerVertical: `${process.env.CERT_BASE_URL || 'http://localhost:5000'}/uploads/branding/banner_vertical.jpg`,
      guidelines: `${process.env.CERT_BASE_URL || 'http://localhost:5000'}/uploads/branding/brand_guidelines.pdf`,
    },
    instructions: 'Use only in co-branded materials. Do not modify the CETCF logo. For approvals contact: info@cetcfoundation.org',
  });
});

module.exports = router;
