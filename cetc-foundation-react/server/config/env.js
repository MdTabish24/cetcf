'use strict';
const crypto = require('crypto');

function parseBool(value) {
  if (typeof value !== 'string') return false;
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
}

function hasValue(name) {
  return Boolean(process.env[name] && String(process.env[name]).trim());
}

function ensureUrl(name, value, issues) {
  try {
    // eslint-disable-next-line no-new
    new URL(value);
  } catch {
    issues.push(`${name} must be a valid URL.`);
  }
}

function inferPublicUrl() {
  const candidates = [
    process.env.RENDER_EXTERNAL_URL,
    process.env.RENDER_EXTERNAL_HOSTNAME ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}` : '',
    process.env.RENDER_PUBLIC_URL,
    process.env.RENDER_SERVICE_NAME ? `https://${process.env.RENDER_SERVICE_NAME}.onrender.com` : '',
    process.env.PUBLIC_URL,
  ];

  for (const candidate of candidates) {
    if (candidate && String(candidate).trim()) {
      return String(candidate).trim();
    }
  }

  return '';
}

function applyRuntimeDefaults(warnings) {
  if (!hasValue('PORT')) {
    process.env.PORT = '5000';
    warnings.push('PORT missing. Falling back to 5000.');
  }

  const inferredPublicUrl = inferPublicUrl();

  if (!hasValue('FRONTEND_URL')) {
    process.env.FRONTEND_URL = inferredPublicUrl || 'http://localhost:5173';
    warnings.push('FRONTEND_URL missing. Using fallback value.');
  }

  if (!hasValue('CERT_BASE_URL')) {
    process.env.CERT_BASE_URL = inferredPublicUrl || 'http://localhost:5000';
    warnings.push('CERT_BASE_URL missing. Using fallback value.');
  }

  const jwtSecret = process.env.JWT_SECRET || '';
  if (jwtSecret.length < 32) {
    process.env.JWT_SECRET = crypto.randomBytes(32).toString('hex');
    warnings.push('JWT_SECRET missing or too short. Generated a temporary secure secret for this deploy.');
  }
}

function reportIssue(message, strictValidation, errors, warnings) {
  if (strictValidation) {
    errors.push(message);
  } else {
    warnings.push(message);
  }
}

function validateEnv() {
  const errors = [];
  const warnings = [];
  const isProduction = process.env.NODE_ENV === 'production';
  const strictValidation = parseBool(process.env.STRICT_ENV_VALIDATION || 'false');

  applyRuntimeDefaults(warnings);

  const requiredBase = [
    'DB_HOST',
    'DB_PORT',
    'DB_NAME',
    'DB_USER',
    'DB_PASSWORD',
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
    if (!hasValue(name)) {
      reportIssue(`${name} is required.`, strictValidation, errors, warnings);
    }
  }

  const jwtSecret = process.env.JWT_SECRET || '';
  if (jwtSecret.length < 32) {
    reportIssue('JWT_SECRET must be at least 32 characters long.', strictValidation, errors, warnings);
  }

  if (process.env.FRONTEND_URL) {
    ensureUrl('FRONTEND_URL', process.env.FRONTEND_URL, strictValidation ? errors : warnings);
  }

  if (process.env.CERT_BASE_URL) {
    ensureUrl('CERT_BASE_URL', process.env.CERT_BASE_URL, strictValidation ? errors : warnings);
  }

  if (isProduction) {
    for (const name of requiredProduction) {
      if (!hasValue(name)) {
        reportIssue(`${name} is required in production.`, strictValidation, errors, warnings);
      }
    }

    if (parseBool(process.env.DEV_MODE || 'false')) {
      reportIssue('DEV_MODE must be false in production.', strictValidation, errors, warnings);
    }
  } else {
    if (parseBool(process.env.DEV_MODE || 'false')) {
      warnings.push('DEV_MODE is enabled. OTP/payment verification is in mock-friendly mode.');
    }
  }

  return { isProduction, strictValidation, errors, warnings };
}

module.exports = { validateEnv, parseBool };
