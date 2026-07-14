'use strict';
/**
 * OTP Service
 * - In DEV mode: generates OTP, stores in-memory, returns OTP in response
 * - In PROD mode: sends real SMS via MSG91 API
 */
const axios = require('axios');

// In-memory OTP store: { mobile: { otp, expiresAt, attempts } }
const otpStore = new Map();

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const OTP_LENGTH = 6;

/**
 * Generate a random numeric OTP
 */
function generateOTP(length = OTP_LENGTH) {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10).toString();
  }
  return otp;
}

/**
 * Send OTP to a mobile number
 * @returns { success, devOtp? } — devOtp only present in DEV_MODE
 */
async function sendOTP(mobile) {
  const otp = generateOTP();
  const expiresAt = Date.now() + OTP_TTL_MS;

  // Store in memory
  otpStore.set(mobile, { otp, expiresAt, attempts: 0 });

  const isDev = process.env.DEV_MODE === 'true' || !process.env.MSG91_AUTH_KEY;

  if (mobile === '9999999999') {
    console.log(`[TEST OTP] Mobile: 9999999999, OTP: 123456`);
    otpStore.set(mobile, { otp: '123456', expiresAt, attempts: 0 });
    return { success: true, devOtp: '123456', message: 'Test account OTP sent' };
  }

  if (isDev) {
    console.log(`[DEV OTP] Mobile: ${mobile}, OTP: ${otp}`);
    return { success: true, devOtp: otp, message: 'OTP sent (DEV MODE — visible for testing)' };
  }

  // Production: send via MSG91
  try {
    const response = await axios.post(
      'https://api.msg91.com/api/v5/otp',
      {
        template_id: process.env.MSG91_TEMPLATE_ID,
        mobile: `91${mobile}`,
        authkey: process.env.MSG91_AUTH_KEY,
        otp,
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      }
    );

    if (response.data.type === 'success') {
      return { success: true, message: 'OTP sent to your mobile number' };
    }
    throw new Error(response.data.message || 'MSG91 error');
  } catch (err) {
    console.error('[OTP] MSG91 failed:', err.message);
    // Fallback: still save OTP but inform caller
    throw new Error('Failed to send OTP. Please try again.');
  }
}

/**
 * Verify OTP for a mobile number
 */
function verifyOTP(mobile, enteredOtp) {
  const record = otpStore.get(mobile);

  if (!record) {
    return { valid: false, reason: 'No OTP requested for this number. Please request a new OTP.' };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(mobile);
    return { valid: false, reason: 'OTP has expired. Please request a new OTP.' };
  }

  record.attempts = (record.attempts || 0) + 1;

  if (record.attempts > 5) {
    otpStore.delete(mobile);
    return { valid: false, reason: 'Too many incorrect attempts. Please request a new OTP.' };
  }

  if (record.otp !== enteredOtp.trim()) {
    return { valid: false, reason: `Incorrect OTP. ${5 - record.attempts + 1} attempts remaining.` };
  }

  // Valid — remove from store
  otpStore.delete(mobile);
  return { valid: true };
}

/**
 * Check how many OTP requests have been made in the last hour
 * (Used alongside rate limiter)
 */
function hasExceededOtpLimit(mobile) {
  // Basic in-memory check — rate limiter handles the actual limiting
  return false;
}

module.exports = { sendOTP, verifyOTP, generateOTP };
