'use strict';

function parseBool(value) {
  if (typeof value !== 'string') return false;
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

function ensureUrl(name, value, errors) {
  try {
    // eslint-disable-next-line no-new
    new URL(value);
  } catch {
    errors.push(`${name} must be a valid URL.`);
  }
}

function validateEnv() {
  const errors = [];
  const warnings = [];
  const isProduction = process.env.NODE_ENV === 'production';

  const requiredBase = [
    'PORT',
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
    'JWT_SECRET',
    'FRONTEND_URL',
    'CERT_BASE_URL',
  ];

  const requiredProduction = [
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'RAZORPAY_WEBHOOK_SECRET',
    'MSG91_AUTH_KEY',
    'MSG91_TEMPLATE_ID',
    'MSG91_SENDER_ID',
    'SENDGRID_API_KEY',
    'SENDGRID_FROM_EMAIL',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_REGION',
    'AWS_S3_BUCKET',
  ];

  for (const name of requiredBase) {
    if (!process.env[name] || !String(process.env[name]).trim()) {
      errors.push(`${name} is required.`);
    }
  }

  const jwtSecret = process.env.JWT_SECRET || '';
  if (jwtSecret.length < 32) {
    errors.push('JWT_SECRET must be at least 32 characters long.');
  }

  if (process.env.FRONTEND_URL) {
    ensureUrl('FRONTEND_URL', process.env.FRONTEND_URL, errors);
  }

  if (process.env.CERT_BASE_URL) {
    ensureUrl('CERT_BASE_URL', process.env.CERT_BASE_URL, errors);
  }

  if (isProduction) {
    for (const name of requiredProduction) {
      if (!process.env[name] || !String(process.env[name]).trim()) {
        errors.push(`${name} is required in production.`);
      }
    }

    if (parseBool(process.env.DEV_MODE || 'false')) {
      errors.push('DEV_MODE must be false in production.');
    }
  } else {
    if (parseBool(process.env.DEV_MODE || 'false')) {
      warnings.push('DEV_MODE is enabled. OTP/payment verification is in mock-friendly mode.');
    }
  }

  return { isProduction, errors, warnings };
}

module.exports = { validateEnv, parseBool };
