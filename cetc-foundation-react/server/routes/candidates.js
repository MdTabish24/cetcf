'use strict';
/**
 * Candidates Routes
 * GET  /api/candidates/profile
 * PUT  /api/candidates/profile
 * POST /api/candidates/profile/photo
 * GET  /api/candidates/dashboard
 * GET  /api/candidates/certificates
 * POST /api/candidates/enroll
 */
const express = require('express');
const multer = require('multer');
const router = express.Router();
const db = require('../db');
const { authenticate, requireCandidate } = require('../middleware/auth');
const { validateProfile } = require('../middleware/validation');
const storage = require('../services/storage');

const upload = multer({
  storage: storage.getMulterStorage('photos'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed.'), false);
    }
    cb(null, true);
  },
});

/**
 * GET /api/candidates/profile
 * Get current candidate profile
 */
router.get('/profile', ...requireCandidate, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, name, mobile, email, photo_url, dob, address, education, aadhaar_optional, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.json({ success: true, profile: result.rows[0] });
  } catch (err) {
    console.error('[Candidates] profile error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch profile.' });
  }
});

/**
 * PUT /api/candidates/profile
 * Update candidate profile
 */
router.put('/profile', authenticate, validateProfile, async (req, res) => {
  const { name, email, dob, address, education, aadhaar_optional } = req.body;
  try {
    const result = await db.query(
      `UPDATE users SET 
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        dob = COALESCE($3, dob),
        address = COALESCE($4, address),
        education = COALESCE($5, education),
        aadhaar_optional = COALESCE($6, aadhaar_optional),
        updated_at = NOW()
       WHERE id = $7 RETURNING id, name, mobile, email, photo_url, dob, address, education`,
      [name, email, dob, address, education, aadhaar_optional, req.user.id]
    );
    return res.json({ success: true, profile: result.rows[0] });
  } catch (err) {
    console.error('[Candidates] profile update error:', err);
    return res.status(500).json({ success: false, message: 'Failed to update profile.' });
  }
});

/**
 * POST /api/candidates/profile/photo
 * Upload profile photo (multipart)
 */
router.post('/profile/photo', authenticate, upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No photo file uploaded.' });
  }
  try {
    const photoUrl = await storage.uploadFile(req.file.path, `photos/${req.file.filename}`, req.file.mimetype);
    await db.query('UPDATE users SET photo_url = $1, updated_at = NOW() WHERE id = $2', [photoUrl, req.user.id]);
    return res.json({ success: true, photoUrl });
  } catch (err) {
    console.error('[Candidates] photo upload error:', err);
    return res.status(500).json({ success: false, message: 'Failed to upload photo.' });
  }
});

/**
 * GET /api/candidates/dashboard
 * Candidate dashboard: enrollments, exams, certificates summary
 */
router.get('/dashboard', ...requireCandidate, async (req, res) => {
  try {
    const userId = req.user.id;

    // Get enrollments with trade and exam details
    const enrollments = await db.query(
      `SELECT c.id, c.trade_id, c.pathway, c.status, c.attempts_used, c.max_attempts, c.enrollment_date,
              t.name as trade_name, t.code as trade_code, t.fee, t.duration_mins,
              (SELECT COUNT(*) FROM exams e WHERE e.candidate_id = c.id) as exam_count,
              (SELECT e2.result FROM exams e2 WHERE e2.candidate_id = c.id ORDER BY e2.created_at DESC LIMIT 1) as last_result,
              (SELECT cert.cert_number FROM certificates cert WHERE cert.candidate_id = c.id LIMIT 1) as cert_number
       FROM candidates c
       JOIN trades t ON c.trade_id = t.id
       WHERE c.user_id = $1
       ORDER BY c.enrollment_date DESC`,
      [userId]
    );

    // Get recent certificates
    const certs = await db.query(
      `SELECT cert.cert_number, cert.grade, cert.issue_date, t.name as trade_name, cert.pdf_url
       FROM certificates cert
       JOIN candidates c ON cert.candidate_id = c.id
       JOIN trades t ON cert.trade_id = t.id
       WHERE c.user_id = $1
       ORDER BY cert.issue_date DESC
       LIMIT 5`,
      [userId]
    );

    // Payment history
    const payments = await db.query(
      `SELECT p.id, p.amount, p.status, p.razorpay_payment_id, p.created_at, t.name as trade_name
       FROM payments p
       LEFT JOIN candidates c ON p.candidate_id = c.id
       LEFT JOIN trades t ON c.trade_id = t.id
       WHERE p.user_id = $1
       ORDER BY p.created_at DESC
       LIMIT 5`,
      [userId]
    );

    return res.json({
      success: true,
      enrollments: enrollments.rows,
      certificates: certs.rows,
      payments: payments.rows,
    });
  } catch (err) {
    console.error('[Candidates] dashboard error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch dashboard data.' });
  }
});

/**
 * GET /api/candidates/certificates
 * List all certificates for the logged-in candidate
 */
router.get('/certificates', ...requireCandidate, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT cert.*, t.name as trade_name, t.code as trade_code
       FROM certificates cert
       JOIN candidates c ON cert.candidate_id = c.id
       JOIN trades t ON cert.trade_id = t.id
       WHERE c.user_id = $1 AND cert.is_revoked = false
       ORDER BY cert.issue_date DESC`,
      [req.user.id]
    );
    return res.json({ success: true, certificates: result.rows });
  } catch (err) {
    console.error('[Candidates] certificates error:', err);
    return res.status(500).json({ success: false, message: 'Failed to fetch certificates.' });
  }
});

/**
 * POST /api/candidates/enroll
 * Enroll in a trade (after payment)
 */
router.post('/enroll', ...requireCandidate, async (req, res) => {
  const { trade_id, payment_id } = req.body;
  if (!trade_id) {
    return res.status(400).json({ success: false, message: 'Trade ID is required.' });
  }

  try {
    // Verify payment if provided
    if (payment_id) {
      const payment = await db.query('SELECT * FROM payments WHERE id = $1 AND status = $2', [payment_id, 'success']);
      if (!payment.rows.length) {
        return res.status(400).json({ success: false, message: 'Valid payment required for enrollment.' });
      }
    }

    // Check if already enrolled
    const existing = await db.query(
      'SELECT * FROM candidates WHERE user_id = $1 AND trade_id = $2',
      [req.user.id, trade_id]
    );

    if (existing.rows.length) {
      return res.status(409).json({ success: false, message: 'Already enrolled in this trade.', candidate: existing.rows[0] });
    }

    const result = await db.query(
      'INSERT INTO candidates (user_id, trade_id, status) VALUES ($1, $2, $3) RETURNING *',
      [req.user.id, trade_id, 'enrolled']
    );

    // Update payment with candidate_id
    if (payment_id) {
      await db.query('UPDATE payments SET candidate_id = $1 WHERE id = $2', [result.rows[0].id, payment_id]);
    }

    return res.status(201).json({ success: true, candidate: result.rows[0] });
  } catch (err) {
    console.error('[Candidates] enroll error:', err);
    return res.status(500).json({ success: false, message: 'Enrollment failed.' });
  }
});

module.exports = router;
