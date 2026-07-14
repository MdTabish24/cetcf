'use strict';
/**
 * Payment Routes
 * POST /api/payments/create-order
 * POST /api/payments/verify
 * POST /api/payments/webhook
 * GET  /api/payments/receipt/:id
 * GET  /api/payments/receipt-file/:filename
 * POST /api/payments/bulk-order
 */
const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const db = require('../db');
const { authenticate, requireCandidate, requirePartner } = require('../middleware/auth');
const { paymentLimiter } = require('../middleware/rateLimiter');
const paymentService = require('../services/payment');
const certService = require('../services/certificate');
const { generateReceiptPDF } = require('../services/certificate');
const { notifyPaymentSuccess } = require('../services/notification');
const { UPLOADS_DIR } = require('../services/storage');

/**
 * POST /api/payments/create-order
 * Create a Razorpay order for trade fee payment
 */
router.post('/create-order', paymentLimiter, authenticate, async (req, res) => {
  const { trade_id, pathway = 'rpl' } = req.body;
  if (!trade_id) {
    return res.status(400).json({ success: false, message: 'Trade ID is required.' });
  }

  try {
    // Get trade fee
    const tradeResult = await db.query('SELECT * FROM trades WHERE id = $1 AND is_active = true', [trade_id]);
    if (!tradeResult.rows.length) {
      return res.status(404).json({ success: false, message: 'Trade not found.' });
    }
    const trade = tradeResult.rows[0];

    // Check if already enrolled & paid
    const existing = await db.query(
      `SELECT c.* FROM candidates c 
       JOIN payments p ON p.candidate_id = c.id 
       WHERE c.user_id = $1 AND c.trade_id = $2 AND p.status = 'success'`,
      [req.user.id, trade_id]
    );
    if (existing.rows.length) {
      return res.status(409).json({ success: false, message: 'Already enrolled and paid for this trade.' });
    }

    const receiptId = `cetcf_${req.user.id}_${trade_id}_${Date.now()}`;
    // Allow free mock payment for testing if mobile is 9999999999
    let isMock = false;
    if (req.user.mobile === '9999999999') {
      isMock = true;
      console.log(`[Payment] Bypassing payment for test user ${req.user.mobile}`);
    }

    const order = await paymentService.createOrder(trade.fee, receiptId, {
      user_id: req.user.id,
      trade_id,
      trade_name: trade.name,
      pathway,
    });

    if (isMock) {
      order.mock = true;
    }

    // Save pending payment record
    const paymentRecord = await db.query(
      `INSERT INTO payments (user_id, amount, razorpay_order_id, status)
       VALUES ($1, $2, $3, 'pending') RETURNING id`,
      [req.user.id, trade.fee, order.id]
    );

    return res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: receiptId,
        mock: order.mock || false,
      },
      paymentRecordId: paymentRecord.rows[0].id,
      key: process.env.RAZORPAY_KEY_ID,
      prefill: {
        name: req.user.name || '',
        contact: req.user.mobile || '',
      },
    });
  } catch (err) {
    console.error('[Payments] create order error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/payments/verify
 * Verify Razorpay payment, enroll candidate, generate receipt
 */
router.post('/verify', paymentLimiter, authenticate, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, trade_id, payment_record_id, pathway = 'rpl' } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ success: false, message: 'Payment verification data is incomplete.' });
  }

  const isValid = paymentService.verifyPaymentSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
  if (!isValid) {
    return res.status(400).json({ success: false, message: 'Payment signature verification failed. Please contact support.' });
  }

  try {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Update payment status
      const paymentResult = await client.query(
        `UPDATE payments SET 
          razorpay_payment_id = $1, razorpay_signature = $2, status = 'success', updated_at = NOW()
         WHERE razorpay_order_id = $3 AND user_id = $4 RETURNING *`,
        [razorpay_payment_id, razorpay_signature, razorpay_order_id, req.user.id]
      );

      if (!paymentResult.rows.length) {
        await client.query('ROLLBACK');
        return res.status(404).json({ success: false, message: 'Payment record not found.' });
      }
      const payment = paymentResult.rows[0];

      // Get trade info
      const tradeResult = await client.query('SELECT * FROM trades WHERE id = $1', [trade_id]);
      const trade = tradeResult.rows[0];

      // Enroll candidate (upsert)
      const candidateResult = await client.query(
        `INSERT INTO candidates (user_id, trade_id, pathway, status)
         VALUES ($1, $2, $3, 'enrolled')
         ON CONFLICT (user_id, trade_id) DO UPDATE SET status = 'enrolled', pathway = EXCLUDED.pathway
         RETURNING *`,
        [req.user.id, trade_id, pathway]
      );
      const candidate = candidateResult.rows[0];

      // Link payment to candidate
      await client.query('UPDATE payments SET candidate_id = $1 WHERE id = $2', [candidate.id, payment.id]);

      await client.query('COMMIT');

      // Generate receipt asynchronously
      const userResult = await db.query('SELECT * FROM users WHERE id = $1', [req.user.id]);
      const user = userResult.rows[0];

      let receiptPdfUrl = null;
      try {
        const { pdfUrl } = await generateReceiptPDF({
          paymentId: String(payment.id),
          candidateName: user.name || 'Candidate',
          tradeName: trade.name,
          amount: payment.amount,
          transactionId: razorpay_payment_id,
          paymentDate: new Date(),
        });
        receiptPdfUrl = pdfUrl;
        await db.query('UPDATE payments SET receipt_pdf_url = $1 WHERE id = $2', [receiptPdfUrl, payment.id]);
      } catch (pdfErr) {
        console.error('[Payments] receipt PDF error:', pdfErr.message);
      }

      // Send notification
      notifyPaymentSuccess(user.mobile, user.email, user.name || 'Candidate', trade.name, payment.amount, razorpay_payment_id).catch(console.warn);

      return res.json({
        success: true,
        message: 'Payment verified! You are now enrolled.',
        candidateId: candidate.id,
        receiptUrl: receiptPdfUrl,
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('[Payments] verify error:', err);
    return res.status(500).json({ success: false, message: 'Payment verification failed. Contact support.' });
  }
});

/**
 * POST /api/payments/webhook
 * Razorpay webhook handler (raw body needed)
 */
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const rawBody = Buffer.isBuffer(req.body)
    ? req.body
    : Buffer.from(typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {}));

  try {
    const isValid = paymentService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
    }

    const event = JSON.parse(rawBody.toString('utf-8'));
    console.log('[Webhook] Event:', event.event);

    if (event.event === 'payment.captured') {
      const { order_id, id: payment_id } = event.payload.payment.entity;
      await db.query(
        `UPDATE payments SET razorpay_payment_id = $1, status = 'success', updated_at = NOW() WHERE razorpay_order_id = $2 AND status = 'pending'`,
        [payment_id, order_id]
      );
    } else if (event.event === 'payment.failed') {
      const { order_id } = event.payload.payment.entity;
      await db.query(
        `UPDATE payments SET status = 'failed', updated_at = NOW() WHERE razorpay_order_id = $1 AND status = 'pending'`,
        [order_id]
      );
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('[Webhook] error:', err);
    return res.status(500).json({ success: false });
  }
});

/**
 * GET /api/payments/receipt/:id
 * Download payment receipt PDF
 */
router.get('/receipt/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      'SELECT p.*, u.name, u.mobile FROM payments p JOIN users u ON p.user_id = u.id WHERE p.id = $1 AND (p.user_id = $2 OR $3 = true)',
      [id, req.user.id, req.user.role === 'admin']
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: 'Payment not found.' });
    }

    const payment = result.rows[0];

    if (payment.receipt_pdf_url) {
      return res.json({ success: true, receiptUrl: payment.receipt_pdf_url });
    }

    return res.status(404).json({ success: false, message: 'Receipt not yet generated.' });
  } catch (err) {
    console.error('[Payments] receipt error:', err);
    return res.status(500).json({ success: false, message: 'Failed to get receipt.' });
  }
});

/**
 * GET /api/payments/receipt-file/:filename
 * Serve local receipt file
 */
router.get('/receipt-file/:filename', (req, res) => {
  const filePath = path.join(UPLOADS_DIR, req.params.filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'File not found.' });
  }
  res.setHeader('Content-Disposition', `attachment; filename="${req.params.filename}"`);
  return res.sendFile(filePath);
});

/**
 * POST /api/payments/bulk-order
 * Partner bulk payment for multiple candidates
 */
router.post('/bulk-order', ...requirePartner, async (req, res) => {
  const { trade_id, candidate_user_ids } = req.body;

  if (!trade_id || !Array.isArray(candidate_user_ids) || !candidate_user_ids.length) {
    return res.status(400).json({ success: false, message: 'Trade ID and candidate list are required.' });
  }

  try {
    const tradeResult = await db.query('SELECT * FROM trades WHERE id = $1 AND is_active = true', [trade_id]);
    if (!tradeResult.rows.length) {
      return res.status(404).json({ success: false, message: 'Trade not found.' });
    }

    const trade = tradeResult.rows[0];
    const totalAmount = trade.fee * candidate_user_ids.length;
    const receiptId = `bulk_${req.user.partnerId}_${trade_id}_${Date.now()}`;

    const order = await paymentService.createOrder(totalAmount, receiptId, {
      partner_id: req.user.partnerId,
      trade_id,
      candidate_count: candidate_user_ids.length,
    });

    // Save bulk payment record
    const paymentRecord = await db.query(
      `INSERT INTO payments (user_id, partner_id, amount, razorpay_order_id, status, is_bulk, bulk_candidate_ids)
       VALUES ($1, $2, $3, $4, 'pending', true, $5) RETURNING id`,
      [req.user.id, req.user.partnerId, totalAmount, order.id, candidate_user_ids]
    );

    return res.json({
      success: true,
      order: { id: order.id, amount: order.amount, currency: order.currency },
      paymentRecordId: paymentRecord.rows[0].id,
      key: process.env.RAZORPAY_KEY_ID,
      candidateCount: candidate_user_ids.length,
      totalAmount,
    });
  } catch (err) {
    console.error('[Payments] bulk order error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
