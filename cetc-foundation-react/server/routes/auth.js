'use strict';
/**
 * Auth Routes
 * POST /api/auth/send-otp
 * POST /api/auth/verify-otp
 * POST /api/auth/partner/login
 * POST /api/auth/admin/login
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../db');
const { sendOTP, verifyOTP } = require('../services/otp');
const { generateToken } = require('../middleware/auth');
const { otpLimiter, loginLimiter } = require('../middleware/rateLimiter');
const { validateSendOtp, validateVerifyOtp, validateAdminLogin } = require('../middleware/validation');
const { notifyRegistration } = require('../services/notification');

/**
 * POST /api/auth/send-otp
 * Send OTP to candidate mobile number
 */
router.post('/send-otp', otpLimiter, validateSendOtp, async (req, res) => {
  const { mobile } = req.body;
  try {
    const result = await sendOTP(mobile);
    return res.json({
      success: true,
      message: result.message || 'OTP sent successfully',
      ...(result.devOtp ? { devOtp: result.devOtp } : {}),
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/auth/verify-otp
 * Verify OTP and login/register candidate
 */
router.post('/verify-otp', validateVerifyOtp, async (req, res) => {
  const { mobile, otp } = req.body;

  const { valid, reason } = verifyOTP(mobile, otp);
  if (!valid) {
    return res.status(400).json({ success: false, message: reason });
  }

  try {
    // Check if user exists
    let user = (await db.query('SELECT * FROM users WHERE mobile = $1', [mobile])).rows[0];
    let isNewUser = false;

    if (!user) {
      // Create new user
      const result = await db.query(
        'INSERT INTO users (mobile, role) VALUES ($1, $2) RETURNING *',
        [mobile, 'candidate']
      );
      user = result.rows[0];
      isNewUser = true;
    }

    const token = generateToken({
      id: user.id,
      mobile: user.mobile,
      name: user.name,
      role: user.role,
    });

    return res.json({
      success: true,
      isNewUser,
      token,
      user: {
        id: user.id,
        mobile: user.mobile,
        name: user.name,
        email: user.email,
        photo_url: user.photo_url,
        role: user.role,
        profileComplete: !!user.name,
      },
    });
  } catch (err) {
    console.error('[Auth] verify-otp error:', err);
    return res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
});
/**
 * POST /api/auth/widget-login
 * Login/register candidate after successful MSG91 Widget OTP verification
 */
router.post('/widget-login', async (req, res) => {
  const { mobile } = req.body;
  if (!mobile || mobile.length < 10) {
    return res.status(400).json({ success: false, message: 'Invalid mobile number' });
  }

  try {
    // Check if user exists
    let user = (await db.query('SELECT * FROM users WHERE mobile = $1', [mobile])).rows[0];
    let isNewUser = false;

    if (!user) {
      // Create new user
      const result = await db.query(
        'INSERT INTO users (mobile, role) VALUES ($1, $2) RETURNING *',
        [mobile, 'candidate']
      );
      user = result.rows[0];
      isNewUser = true;
    }

    const token = generateToken({
      id: user.id,
      mobile: user.mobile,
      name: user.name,
      role: user.role,
    });

    return res.json({
      success: true,
      isNewUser,
      token,
      user: {
        id: user.id,
        mobile: user.mobile,
        name: user.name,
        email: user.email,
        photo_url: user.photo_url,
        role: user.role,
        profileComplete: !!(user.name && user.photo_url),
      },
    });
  } catch (err) {
    console.error('[Auth] widget-login error:', err);
    return res.status(500).json({ success: false, message: 'Server error during widget login.' });
  }
});

/**
 * POST /api/auth/partner/login
 * Partner credential-based login (mobile + password)
 */
router.post('/partner/login', loginLimiter, async (req, res) => {
  const { mobile, password } = req.body;

  if (!mobile || !password) {
    return res.status(400).json({ success: false, message: 'Mobile number and password are required.' });
  }

  try {
    const result = await db.query(
      'SELECT p.*, u.mobile, u.name FROM partners p JOIN users u ON p.user_id = u.id WHERE u.mobile = $1 AND p.status = $2',
      [mobile, 'approved']
    );
    const partner = result.rows[0];

    if (!partner) {
      return res.status(401).json({ success: false, message: 'Invalid credentials or account not approved.' });
    }

    const isMatch = await bcrypt.compare(password, partner.password_hash || '');
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = generateToken({
      id: partner.user_id,
      partnerId: partner.id,
      mobile: partner.mobile,
      name: partner.contact_name,
      role: 'partner',
    });

    return res.json({
      success: true,
      token,
      partner: {
        id: partner.id,
        orgName: partner.org_name,
        contactName: partner.contact_name,
        mobile: partner.mobile,
        status: partner.status,
      },
    });
  } catch (err) {
    console.error('[Auth] partner login error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/**
 * POST /api/auth/admin/login
 * Admin email+password login
 */
router.post('/admin/login', loginLimiter, validateAdminLogin, async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await db.query(
      'SELECT * FROM admins WHERE email = $1 AND is_active = true',
      [email]
    );
    const admin = result.rows[0];

    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // For initial admin: check against env var
    let isMatch = false;
    if (process.env.DEV_MODE === 'true' && password === (process.env.ADMIN_INITIAL_PASSWORD || 'Admin@CETCF2025')) {
      isMatch = true;
    } else {
      isMatch = await bcrypt.compare(password, admin.password_hash);
    }

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    // Update last login
    await db.query('UPDATE admins SET last_login = NOW() WHERE id = $1', [admin.id]);

    const token = generateToken({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: 'admin',
    });

    return res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: 'admin',
      },
    });
  } catch (err) {
    console.error('[Auth] admin login error:', err);
    return res.status(500).json({ success: false, message: 'Server error.' });
  }
});

/**
 * POST /api/auth/refresh
 * Refresh JWT token (if still valid)
 */
router.post('/refresh', require('../middleware/auth').authenticate, async (req, res) => {
  const { id, mobile, name, role, email, partnerId } = req.user;
  const newToken = generateToken({ id, mobile, name, role, email, partnerId });
  return res.json({ success: true, token: newToken });
});

module.exports = router;
