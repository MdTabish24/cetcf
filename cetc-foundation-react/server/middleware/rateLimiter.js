'use strict';
const rateLimit = require('express-rate-limit');

/**
 * OTP rate limiter: max 3 requests per hour per IP+mobile combination
 */
const otpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  keyGenerator: (req) => {
    const mobile = req.body?.mobile || 'unknown';
    return `${req.ip}-${mobile}`;
  },
  message: {
    success: false,
    message: 'Too many OTP requests. Maximum 3 OTPs per hour. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API rate limiter: 200 requests per 15 minutes per IP
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict limiter for payment endpoints: 10 per 15 mins
 */
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many payment requests. Please wait before retrying.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Login limiter: 10 attempts per 15 minutes per IP
 */
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many login attempts. Please wait 15 minutes before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { otpLimiter, generalLimiter, paymentLimiter, loginLimiter };
