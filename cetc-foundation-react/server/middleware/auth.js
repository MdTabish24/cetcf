'use strict';
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'cetcf_dev_secret_key';

/**
 * Verify JWT from Authorization header
 * Attaches req.user = { id, mobile, name, role }
 */
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required. Please log in.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Session expired. Please log in again.' });
    }
    return res.status(401).json({ success: false, message: 'Invalid authentication token.' });
  }
}

/**
 * Role-based access control
 * Usage: requireRole('admin'), requireRole('partner'), requireRole(['admin','partner'])
 */
function requireRole(roles) {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}.`,
      });
    }
    next();
  };
}

/**
 * Admin-only shorthand
 */
const requireAdmin = [authenticate, requireRole('admin')];

/**
 * Partner or Admin shorthand
 */
const requirePartner = [authenticate, requireRole(['partner', 'admin'])];

/**
 * Candidate or Admin shorthand
 */
const requireCandidate = [authenticate, requireRole(['candidate', 'admin'])];

/**
 * Generate JWT token
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '30d' });
}

module.exports = { authenticate, requireRole, requireAdmin, requirePartner, requireCandidate, generateToken };
