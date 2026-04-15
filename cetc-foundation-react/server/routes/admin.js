'use strict';
/**
 * Admin Panel Routes
 * GET  /api/admin/dashboard
 * GET  /api/admin/candidates
 * GET  /api/admin/partners
 * PUT  /api/admin/partners/:id/status
 * GET  /api/admin/questions
 * POST /api/admin/questions
 * POST /api/admin/questions/bulk
 * PUT  /api/admin/questions/:id/status
 * DELETE /api/admin/questions/:id
 * GET  /api/admin/payments
 * GET  /api/admin/certificates
 * PUT  /api/admin/settings
 * GET  /api/admin/settings
 * POST /api/admin/notifications/broadcast
 */
const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');
const { validateQuestion } = require('../middleware/validation');
const { notifyPartnerApproval } = require('../services/notification');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// All routes require admin auth
router.use(...requireAdmin);

/**
 * GET /api/admin/dashboard
 * Live KPIs: revenue, certificates, exams, partners
 */
router.get('/dashboard', async (req, res) => {
  try {
    const [
      revenueToday,
      certsToday,
      examsOngoing,
      newPartnersWeek,
      totalCandidates,
      totalCerts,
      totalPartners,
      recentExams,
      monthlyStats,
      tradeStats,
    ] = await Promise.all([
      db.query(`SELECT COALESCE(SUM(amount), 0) as revenue FROM payments WHERE status = 'success' AND DATE(created_at) = CURRENT_DATE`),
      db.query(`SELECT COUNT(*) as count FROM certificates WHERE DATE(issue_date) = CURRENT_DATE`),
      db.query(`SELECT COUNT(*) as count FROM exams WHERE result = 'ongoing'`),
      db.query(`SELECT COUNT(*) as count FROM partners WHERE created_at >= NOW() - INTERVAL '7 days'`),
      db.query(`SELECT COUNT(*) as count FROM users WHERE role = 'candidate'`),
      db.query(`SELECT COUNT(*) as count FROM certificates WHERE is_revoked = false`),
      db.query(`SELECT COUNT(*) as count FROM partners WHERE status = 'approved'`),
      db.query(`SELECT e.id, u.name, t.name as trade_name, e.result, e.score, e.created_at FROM exams e JOIN candidates c ON e.candidate_id = c.id JOIN users u ON c.user_id = u.id JOIN trades t ON e.trade_id = t.id ORDER BY e.created_at DESC LIMIT 10`),
      db.query(`SELECT DATE_TRUNC('month', issue_date) as month, COUNT(*) as count FROM certificates WHERE issue_date >= NOW() - INTERVAL '12 months' GROUP BY 1 ORDER BY 1`),
      db.query(`SELECT t.name, COUNT(cert.id) as total FROM trades t LEFT JOIN certificates cert ON cert.trade_id = t.id GROUP BY t.id, t.name ORDER BY total DESC`),
    ]);

    return res.json({
      success: true,
      kpis: {
        revenueToday: parseInt(revenueToday.rows[0]?.revenue) || 0,
        certsToday: parseInt(certsToday.rows[0]?.count) || 0,
        examsOngoing: parseInt(examsOngoing.rows[0]?.count) || 0,
        newPartnersWeek: parseInt(newPartnersWeek.rows[0]?.count) || 0,
        totalCandidates: parseInt(totalCandidates.rows[0]?.count) || 0,
        totalCerts: parseInt(totalCerts.rows[0]?.count) || 0,
        totalPartners: parseInt(totalPartners.rows[0]?.count) || 0,
      },
      charts: {
        monthlyCerts: monthlyStats.rows,
        tradeBreakdown: tradeStats.rows,
      },
      recentExams: recentExams.rows,
    });
  } catch (err) {
    console.error('[Admin] dashboard error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch dashboard data.' });
  }
});

/**
 * GET /api/admin/candidates
 * All candidates with search and pagination
 */
router.get('/candidates', async (req, res) => {
  const { search, trade_id, status, page = 1, limit = 20 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);

  try {
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      whereClause += ` AND (u.name ILIKE $${params.length} OR u.mobile ILIKE $${params.length})`;
    }
    if (trade_id) {
      params.push(trade_id);
      whereClause += ` AND c.trade_id = $${params.length}`;
    }
    if (status) {
      params.push(status);
      whereClause += ` AND c.status = $${params.length}`;
    }

    params.push(parseInt(limit), offset);

    const result = await db.query(
      `SELECT u.id as user_id, u.name, u.mobile, u.email, u.photo_url, u.created_at,
              c.id as candidate_id, c.trade_id, c.status, c.enrollment_date, c.attempts_used,
              t.name as trade_name,
              (SELECT cert.cert_number FROM certificates cert WHERE cert.candidate_id = c.id LIMIT 1) as cert_number
       FROM users u
       JOIN candidates c ON c.user_id = u.id
       JOIN trades t ON c.trade_id = t.id
       ${whereClause}
       ORDER BY c.enrollment_date DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const countResult = await db.query(
      `SELECT COUNT(*) as total FROM users u JOIN candidates c ON c.user_id = u.id JOIN trades t ON c.trade_id = t.id ${whereClause}`,
      params.slice(0, -2)
    );

    return res.json({
      success: true,
      candidates: result.rows,
      pagination: {
        total: parseInt(countResult.rows[0].total),
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(parseInt(countResult.rows[0].total) / parseInt(limit)),
      },
    });
  } catch (err) {
    console.error('[Admin] candidates error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch candidates.' });
  }
});

/**
 * GET /api/admin/partners
 * All partner records
 */
router.get('/partners', async (req, res) => {
  const { status, search } = req.query;
  try {
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (status) { params.push(status); whereClause += ` AND p.status = $${params.length}`; }
    if (search) { params.push(`%${search}%`); whereClause += ` AND (p.org_name ILIKE $${params.length} OR p.mobile ILIKE $${params.length})`; }

    const result = await db.query(
      `SELECT p.*,
              (SELECT COUNT(*) FROM batches b WHERE b.partner_id = p.id) as batch_count
       FROM partners p ${whereClause}
       ORDER BY p.created_at DESC`,
      params
    );

    return res.json({ success: true, partners: result.rows });
  } catch (err) {
    console.error('[Admin] partners error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch partners.' });
  }
});

/**
 * PUT /api/admin/partners/:id/status
 * Approve / reject / suspend partner
 */
router.put('/partners/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status, reason, commission_rate } = req.body;

  if (!['approved', 'rejected', 'suspended'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status. Use: approved, rejected, or suspended.' });
  }

  try {
    const result = await db.query(
      `UPDATE partners SET status = $1, rejection_reason = $2, commission_rate = COALESCE($3, commission_rate), updated_at = NOW() WHERE id = $4 RETURNING *`,
      [status, reason || null, commission_rate, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Partner not found.' });
    }

    const partner = result.rows[0];

    // Notify partner
    notifyPartnerApproval(partner.mobile, partner.email, partner.org_name, status, reason).catch(console.warn);

    // If approved, set partner role on user
    if (status === 'approved') {
      await db.query("UPDATE users SET role = 'partner' WHERE id = $1", [partner.user_id]);

      // Generate initial password if not set
      if (!partner.password_hash) {
        const tempPass = `CETCF${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const hash = await bcrypt.hash(tempPass, 10);
        await db.query('UPDATE partners SET password_hash = $1 WHERE id = $2', [hash, id]);
        console.log(`[Admin] Partner ${partner.org_name} temp password: ${tempPass}`);
      }
    }

    return res.json({ success: true, partner: result.rows[0], message: `Partner ${status} successfully.` });
  } catch (err) {
    console.error('[Admin] partner status error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update partner status.' });
  }
});

/**
 * GET /api/admin/questions
 * Question bank with filters
 */
router.get('/questions', async (req, res) => {
  const { trade_id, difficulty, status, page = 1, limit = 50 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  try {
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (trade_id) { params.push(trade_id); whereClause += ` AND q.trade_id = $${params.length}`; }
    if (difficulty) { params.push(difficulty); whereClause += ` AND q.difficulty = $${params.length}`; }
    if (status) { params.push(status); whereClause += ` AND q.status = $${params.length}`; }

    params.push(parseInt(limit), offset);

    const result = await db.query(
      `SELECT q.*, t.name as trade_name FROM questions q JOIN trades t ON q.trade_id = t.id
       ${whereClause} ORDER BY q.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const countResult = await db.query(
      `SELECT COUNT(*) as total FROM questions q ${whereClause}`,
      params.slice(0, -2)
    );

    return res.json({ success: true, questions: result.rows, total: parseInt(countResult.rows[0].total) });
  } catch (err) {
    console.error('[Admin] questions error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch questions.' });
  }
});

/**
 * POST /api/admin/questions
 * Add a single question
 */
router.post('/questions', validateQuestion, async (req, res) => {
  const { trade_id, question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty, explanation } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO questions (trade_id, question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty, explanation, created_by, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'draft') RETURNING *`,
      [trade_id, question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty, explanation, req.user.id]
    );
    return res.status(201).json({ success: true, question: result.rows[0] });
  } catch (err) {
    console.error('[Admin] add question error:', err);
    return res.status(500).json({ success: false, message: 'Failed to add question.' });
  }
});

/**
 * POST /api/admin/questions/bulk
 * Bulk import questions from Excel
 * Expected columns: Trade Code, Question, Option A, Option B, Option C, Option D, Correct Answer, Difficulty, Explanation
 */
router.post('/questions/bulk', upload.single('excel'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'Excel file required.' });

  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    const results = { imported: [], errors: [] };

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNum = i + 2;

      const tradeCode = String(row['Trade Code'] || row['Trade'] || '').trim().toUpperCase();
      const questionText = String(row['Question'] || row['question_text'] || '').trim();
      const optA = String(row['Option A'] || row['option_a'] || '').trim();
      const optB = String(row['Option B'] || row['option_b'] || '').trim();
      const optC = String(row['Option C'] || row['option_c'] || '').trim();
      const optD = String(row['Option D'] || row['option_d'] || '').trim();
      const correctAnswer = String(row['Correct Answer'] || row['correct_answer'] || '').trim().toUpperCase();
      const difficulty = String(row['Difficulty'] || row['difficulty'] || 'medium').trim().toLowerCase();
      const explanation = String(row['Explanation'] || row['explanation'] || '').trim();

      if (!tradeCode || !questionText || !optA || !optB || !optC || !optD) {
        results.errors.push({ row: rowNum, issue: 'Missing required fields' }); continue;
      }
      if (!['A', 'B', 'C', 'D'].includes(correctAnswer)) {
        results.errors.push({ row: rowNum, issue: 'Correct answer must be A/B/C/D' }); continue;
      }
      if (!['easy', 'medium', 'hard'].includes(difficulty)) {
        results.errors.push({ row: rowNum, issue: 'Difficulty must be easy/medium/hard' }); continue;
      }

      const tradeResult = await db.query('SELECT id FROM trades WHERE code = $1', [tradeCode]);
      if (!tradeResult.rows.length) {
        results.errors.push({ row: rowNum, issue: `Trade '${tradeCode}' not found` }); continue;
      }

      try {
        await db.query(
          `INSERT INTO questions (trade_id, question_text, option_a, option_b, option_c, option_d, correct_answer, difficulty, explanation, created_by, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'draft')`,
          [tradeResult.rows[0].id, questionText, optA, optB, optC, optD, correctAnswer, difficulty, explanation, req.user.id]
        );
        results.imported.push({ row: rowNum, tradeCode, questionText: questionText.substring(0, 50) });
      } catch (qErr) {
        results.errors.push({ row: rowNum, issue: qErr.message });
      }
    }

    return res.json({ success: true, summary: { total: rows.length, imported: results.imported.length, errors: results.errors.length }, details: results });
  } catch (err) {
    console.error('[Admin] bulk questions error:', err);
    return res.status(500).json({ success: false, message: 'Failed to process file.' });
  }
});

/**
 * PUT /api/admin/questions/:id/status
 * Change question status: draft → review → approved
 */
router.put('/questions/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['draft', 'review', 'approved'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Status must be draft, review, or approved.' });
  }
  try {
    const result = await db.query('UPDATE questions SET status = $1 WHERE id = $2 RETURNING *', [status, id]);
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Question not found.' });
    return res.json({ success: true, question: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update status.' });
  }
});

/**
 * DELETE /api/admin/questions/:id
 */
router.delete('/questions/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM questions WHERE id = $1', [req.params.id]);
    return res.json({ success: true, message: 'Question deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete question.' });
  }
});

/**
 * GET /api/admin/payments
 * All payments with search
 */
router.get('/payments', async (req, res) => {
  const { status, search, page = 1, limit = 30 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  try {
    const params = [];
    let where = 'WHERE 1=1';
    if (status) { params.push(status); where += ` AND p.status = $${params.length}`; }
    if (search) { params.push(`%${search}%`); where += ` AND (u.name ILIKE $${params.length} OR u.mobile ILIKE $${params.length} OR p.razorpay_payment_id ILIKE $${params.length})`; }
    params.push(parseInt(limit), offset);

    const result = await db.query(
      `SELECT p.*, u.name as user_name, u.mobile, t.name as trade_name
       FROM payments p
       JOIN users u ON p.user_id = u.id
       LEFT JOIN candidates c ON p.candidate_id = c.id
       LEFT JOIN trades t ON c.trade_id = t.id
       ${where} ORDER BY p.created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const total = await db.query(
      `SELECT COUNT(*) as c FROM payments p JOIN users u ON p.user_id = u.id LEFT JOIN candidates c ON p.candidate_id = c.id LEFT JOIN trades t ON c.trade_id = t.id ${where}`,
      params.slice(0, -2)
    );

    return res.json({ success: true, payments: result.rows, total: parseInt(total.rows[0].c) });
  } catch (err) {
    console.error('[Admin] payments error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch payments.' });
  }
});

/**
 * GET /api/admin/certificates
 * All certificates
 */
router.get('/certificates', async (req, res) => {
  const { trade_id, is_revoked, page = 1, limit = 30 } = req.query;
  const offset = (parseInt(page) - 1) * parseInt(limit);
  try {
    const params = [];
    let where = 'WHERE 1=1';
    if (trade_id) { params.push(trade_id); where += ` AND cert.trade_id = $${params.length}`; }
    if (is_revoked !== undefined) { params.push(is_revoked === 'true'); where += ` AND cert.is_revoked = $${params.length}`; }
    params.push(parseInt(limit), offset);

    const result = await db.query(
      `SELECT cert.*, u.name as candidate_name, u.mobile, t.name as trade_name
       FROM certificates cert
       JOIN candidates c ON cert.candidate_id = c.id
       JOIN users u ON c.user_id = u.id
       JOIN trades t ON cert.trade_id = t.id
       ${where} ORDER BY cert.issue_date DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    return res.json({ success: true, certificates: result.rows });
  } catch (err) {
    console.error('[Admin] certificates error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch certificates.' });
  }
});

/**
 * PUT /api/admin/certificates/:id/revoke
 * Revoke a certificate from admin panel
 */
router.put('/certificates/:id/revoke', async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  try {
    const result = await db.query(
      'UPDATE certificates SET is_revoked = true WHERE id = $1 RETURNING *',
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Certificate not found.' });
    }

    await db.query(
      `INSERT INTO notifications (type, recipient, template, message, status)
       VALUES ('email', 'admin_audit', 'certificate_revoked', $1, 'sent')`,
      [`Certificate ${result.rows[0].cert_number} revoked by admin ${req.user?.email || req.user?.id || 'unknown'}${reason ? ` | reason: ${reason}` : ''}`]
    );

    return res.json({ success: true, certificate: result.rows[0], message: 'Certificate revoked successfully.' });
  } catch (err) {
    console.error('[Admin] revoke certificate error:', err);
    return res.status(500).json({ success: false, message: 'Failed to revoke certificate.' });
  }
});

/**
 * GET /api/admin/settings
 */
router.get('/settings', async (req, res) => {
  try {
    const trades = await db.query('SELECT id, code, name, fee, passing_marks, question_count, duration_mins, commission_rate, is_active FROM trades ORDER BY name');
    return res.json({ success: true, trades: trades.rows });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to load settings.' });
  }
});

/**
 * PUT /api/admin/settings
 * Update global settings (trade fees, passing marks, etc.)
 */
router.put('/settings', async (req, res) => {
  const { trades } = req.body;
  if (!Array.isArray(trades)) return res.status(400).json({ success: false, message: 'trades array required.' });

  try {
    for (const trade of trades) {
      if (!trade.id) continue;
      await db.query(
        'UPDATE trades SET fee = COALESCE($1, fee), passing_marks = COALESCE($2, passing_marks), commission_rate = COALESCE($3, commission_rate), is_active = COALESCE($4, is_active) WHERE id = $5',
        [trade.fee, trade.passing_marks, trade.commission_rate, trade.is_active, trade.id]
      );
    }
    return res.json({ success: true, message: 'Settings updated.' });
  } catch (err) {
    console.error('[Admin] settings error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update settings.' });
  }
});

/**
 * POST /api/admin/notifications/broadcast
 * Send broadcast message to all candidates/partners/specific group
 */
router.post('/notifications/broadcast', async (req, res) => {
  const { target, message, via } = req.body; // target: 'all_candidates' | 'all_partners' | 'passed_candidates'

  if (!message) return res.status(400).json({ success: false, message: 'Message is required.' });

  try {
    let users = [];
    if (target === 'all_candidates') {
      users = (await db.query("SELECT mobile, email FROM users WHERE role = 'candidate' AND is_active = true")).rows;
    } else if (target === 'all_partners') {
      users = (await db.query("SELECT p.mobile, p.email FROM partners p WHERE p.status = 'approved'")).rows;
    } else if (target === 'passed_candidates') {
      users = (await db.query("SELECT DISTINCT u.mobile, u.email FROM users u JOIN candidates c ON c.user_id = u.id WHERE c.status = 'passed'")).rows;
    }

    // Log broadcast (actual sending would be async in production)
    console.log(`[Admin] Broadcasting to ${users.length} users via ${via || 'sms'}: ${message.substring(0, 100)}`);

    // Save notification log
    await db.query(
      `INSERT INTO notifications (type, recipient, message, status) VALUES ($1, $2, $3, 'sent')`,
      [via || 'sms', `${target} (${users.length} users)`, message]
    );

    return res.json({ success: true, message: `Broadcast queued for ${users.length} users.`, count: users.length });
  } catch (err) {
    console.error('[Admin] broadcast error:', err);
    return res.status(500).json({ success: false, message: 'Broadcast failed.' });
  }
});

module.exports = router;
