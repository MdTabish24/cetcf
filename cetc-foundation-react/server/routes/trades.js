'use strict';
/**
 * Trades Routes
 * GET /api/trades
 * GET /api/trades/:id
 * PUT /api/trades/:id (admin only)
 */
const express = require('express');
const router = express.Router();
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');

/**
 * GET /api/trades
 * List all active trades with fees and basic info
 */
router.get('/', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT id, code, name, description, fee, passing_marks, question_count, duration_mins, 
              commission_rate, syllabus_topics, is_active
       FROM trades 
       WHERE is_active = true 
       ORDER BY name ASC`
    );
    return res.json({ success: true, trades: result.rows });
  } catch (err) {
    console.error('[Trades] list error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch trades.' });
  }
});

/**
 * GET /api/trades/:id
 * Get trade details with question count
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const tradeResult = await db.query('SELECT * FROM trades WHERE id = $1', [id]);
    if (!tradeResult.rows.length) {
      return res.status(404).json({ success: false, message: 'Trade not found.' });
    }
    const trade = tradeResult.rows[0];

    // Count approved questions
    const qCount = await db.query(
      "SELECT COUNT(*) as count FROM questions WHERE trade_id = $1 AND status = 'approved'",
      [id]
    );
    trade.approved_question_count = parseInt(qCount.rows[0].count);

    return res.json({ success: true, trade });
  } catch (err) {
    console.error('[Trades] detail error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch trade details.' });
  }
});

/**
 * PUT /api/trades/:id
 * Admin: Update trade configuration
 */
router.put('/:id', ...requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, description, fee, passing_marks, question_count, duration_mins, commission_rate, is_active, syllabus_topics } = req.body;

  try {
    const result = await db.query(
      `UPDATE trades SET 
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        fee = COALESCE($3, fee),
        passing_marks = COALESCE($4, passing_marks),
        question_count = COALESCE($5, question_count),
        duration_mins = COALESCE($6, duration_mins),
        commission_rate = COALESCE($7, commission_rate),
        is_active = COALESCE($8, is_active),
        syllabus_topics = COALESCE($9, syllabus_topics)
       WHERE id = $10 RETURNING *`,
      [name, description, fee, passing_marks, question_count, duration_mins, commission_rate, is_active, syllabus_topics, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Trade not found.' });
    }

    return res.json({ success: true, trade: result.rows[0] });
  } catch (err) {
    console.error('[Trades] update error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update trade.' });
  }
});

/**
 * POST /api/trades
 * Admin: Create a new trade
 */
router.post('/', ...requireAdmin, async (req, res) => {
  const { code, name, description, fee, passing_marks, question_count, duration_mins, commission_rate, syllabus_topics } = req.body;

  if (!code || !name) {
    return res.status(400).json({ success: false, message: 'Trade code and name are required.' });
  }

  try {
    const result = await db.query(
      `INSERT INTO trades (code, name, description, fee, passing_marks, question_count, duration_mins, commission_rate, syllabus_topics)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [code.toUpperCase(), name, description, fee || 1000, passing_marks || 40, question_count || 60, duration_mins || 90, commission_rate || 200, syllabus_topics || []]
    );
    return res.status(201).json({ success: true, trade: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ success: false, message: `Trade code '${code.toUpperCase()}' already exists.` });
    }
    console.error('[Trades] create error:', err);
    return res.status(500).json({ success: false, message: 'Failed to create trade.' });
  }
});

module.exports = router;
