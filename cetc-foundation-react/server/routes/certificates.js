'use strict';
/**
 * Certificate Routes
 * GET  /api/certificates/verify/:certNumber  (public)
 * GET  /api/certificates/:id/download
 * POST /api/certificates/generate  (admin/system)
 * PUT  /api/certificates/:id/revoke  (admin)
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const db = require('../db');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { generateCertificatePDF, generateCertNumber, calculateGrade } = require('../services/certificate');
const { UPLOADS_DIR } = require('../services/storage');

/**
 * GET /api/certificates/verify/:certNumber
 * PUBLIC — Verify certificate by number
 * Supports both: CETC/2025/BEAUTY/001247 and URL-encoded version
 */
router.get('/verify/:certNumber(*)', async (req, res) => {
  const certNumber = decodeURIComponent(req.params.certNumber);

  try {
    const result = await db.query(
      `SELECT 
        cert.cert_number, cert.grade, cert.score, cert.percentage, cert.issue_date,
        cert.is_revoked, cert.qr_url, cert.pdf_url,
        u.name as candidate_name, u.photo_url,
        t.name as trade_name, t.code as trade_code,
        p.org_name as issuing_center
       FROM certificates cert
       JOIN candidates c ON cert.candidate_id = c.id
       JOIN users u ON c.user_id = u.id
       JOIN trades t ON cert.trade_id = t.id
       LEFT JOIN partners p ON c.user_id = p.user_id
       WHERE cert.cert_number = $1`,
      [certNumber]
    );

    if (!result.rows.length) {
      return res.status(404).json({
        success: false,
        valid: false,
        message: 'Certificate not found — This may be fake. Please verify the certificate number carefully.',
      });
    }

    const cert = result.rows[0];

    if (cert.is_revoked) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: 'This certificate has been revoked by CETC Foundation.',
      });
    }

    return res.json({
      success: true,
      valid: true,
      certificate: {
        certNumber: cert.cert_number,
        candidateName: cert.candidate_name,
        candidatePhoto: cert.photo_url,
        tradeName: cert.trade_name,
        tradeCode: cert.trade_code,
        grade: cert.grade,
        score: cert.score,
        percentage: cert.percentage,
        issueDate: cert.issue_date,
        issuingCenter: cert.issuing_center || 'CETC Foundation, Bhiwandi',
        pdfUrl: cert.pdf_url,
        whatsAppShareText: `This candidate is CETC Certified!\n\n👤 Name: ${cert.candidate_name}\n🏆 Trade: ${cert.trade_name}\n🎓 Grade: ${cert.grade}\n🔖 Certificate: ${cert.cert_number}\n✅ Issued by CETC Foundation\n\nVerify at: ${process.env.CERT_BASE_URL}/verify?cert=${encodeURIComponent(cert.cert_number)}`,
      },
    });
  } catch (err) {
    console.error('[Certificates] verify error:', err);
    return res.status(500).json({ success: false, message: 'Verification failed. Please try again.' });
  }
});

/**
 * GET /api/certificates/:id/download
 * Download or redirect to certificate PDF
 */
router.get('/:id/download', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `SELECT cert.*, c.user_id FROM certificates cert JOIN candidates c ON cert.candidate_id = c.id WHERE cert.id = $1`,
      [id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Certificate not found.' });
    }

    const cert = result.rows[0];

    if (cert.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (cert.pdf_url && cert.pdf_url.startsWith('http')) {
      return res.redirect(cert.pdf_url);
    }

    // Serve local file if available
    const fileName = `${cert.cert_number.replace(/\//g, '-')}.pdf`;
    const localPath = path.join(UPLOADS_DIR, fileName);
    if (fs.existsSync(localPath)) {
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.sendFile(localPath);
    }

    // Try temp dir
    const tempPath = path.join(__dirname, '../temp', fileName);
    if (fs.existsSync(tempPath)) {
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.sendFile(tempPath);
    }

    return res.status(404).json({ success: false, message: 'Certificate PDF not found. Please regenerate.' });
  } catch (err) {
    console.error('[Certificates] download error:', err);
    return res.status(500).json({ success: false, message: 'Download failed.' });
  }
});

/**
 * POST /api/certificates/generate
 * Admin: Manually generate certificate for a passed exam
 */
router.post('/generate', ...requireAdmin, async (req, res) => {
  const { exam_id } = req.body;
  if (!exam_id) {
    return res.status(400).json({ success: false, message: 'Exam ID is required.' });
  }

  try {
    const examResult = await db.query(
      `SELECT e.*, c.id as cand_id, t.name as trade_name, t.code as trade_code, t.passing_marks,
              u.name as user_name, u.photo_url, u.mobile, u.email
       FROM exams e join candidates c ON e.candidate_id = c.id
       JOIN trades t ON e.trade_id = t.id
       JOIN users u ON c.user_id = u.id
       WHERE e.id = $1 AND e.result = 'pass'`,
      [exam_id]
    );

    if (!examResult.rows.length) {
      return res.status(404).json({ success: false, message: 'Passed exam not found.' });
    }

    const exam = examResult.rows[0];
    const percentage = (exam.score / exam.total_questions) * 100;
    const grade = calculateGrade(percentage);

    if (!grade) {
      return res.status(400).json({ success: false, message: 'Exam did not pass (no grade assigned).' });
    }

    // Check if cert already exists
    const existingCert = await db.query('SELECT * FROM certificates WHERE exam_id = $1', [exam_id]);
    if (existingCert.rows.length) {
      return res.json({ success: true, certificate: existingCert.rows[0], message: 'Certificate already generated.' });
    }

    // Get sequence
    const seqResult = await db.query(
      'SELECT COUNT(*) + 1 as seq FROM certificates WHERE trade_id = $1',
      [exam.trade_id]
    );
    const certNumber = generateCertNumber(exam.trade_code, parseInt(seqResult.rows[0].seq));

    const { pdfUrl, qrUrl } = await generateCertificatePDF({
      candidateName: exam.user_name || 'Candidate',
      tradeName: exam.trade_name,
      tradeCode: exam.trade_code,
      certNumber,
      score: exam.score,
      totalMarks: exam.total_questions,
      grade,
      issueDate: new Date().toISOString(),
      photoUrl: exam.photo_url,
    });

    const certRecord = await db.query(
      `INSERT INTO certificates (candidate_id, exam_id, cert_number, trade_id, grade, score, percentage, qr_url, pdf_url, verification_hash)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [exam.cand_id, exam_id, certNumber, exam.trade_id, grade, exam.score, percentage.toFixed(2), qrUrl, pdfUrl, require('crypto').createHash('sha256').update(certNumber).digest('hex')]
    );

    return res.json({ success: true, certificate: certRecord.rows[0] });
  } catch (err) {
    console.error('[Certificates] generate error:', err);
    return res.status(500).json({ success: false, message: 'Certificate generation failed.' });
  }
});

/**
 * PUT /api/certificates/:id/revoke
 * Admin: Revoke a certificate
 */
router.put('/:id/revoke', ...requireAdmin, async (req, res) => {
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

    console.log(`[Admin] Certificate ${id} revoked. Reason: ${reason || 'Not specified'}`);
    return res.json({ success: true, message: 'Certificate revoked successfully.' });
  } catch (err) {
    console.error('[Certificates] revoke error:', err);
    return res.status(500).json({ success: false, message: 'Failed to revoke certificate.' });
  }
});

/**
 * GET /api/certificates/by-number/:certNumber
 * Download by cert number (used in partner/admin panels)
 */
router.get('/by-number/:certNumber(*)', authenticate, async (req, res) => {
  const certNumber = decodeURIComponent(req.params.certNumber);
  try {
    const result = await db.query('SELECT * FROM certificates WHERE cert_number = $1', [certNumber]);
    if (!result.rows.length) return res.status(404).json({ success: false, message: 'Not found.' });
    return res.json({ success: true, certificate: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Error.' });
  }
});

module.exports = router;
