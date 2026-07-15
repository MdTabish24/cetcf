'use strict';
/**
 * Request validation middleware using express-validator
 */
const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware to check validation results and return formatted errors
 */
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

// --- Auth Validators ---
const validateSendOtp = [
  body('mobile')
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Enter a valid 10-digit Indian mobile number'),
  validate,
];

const validateVerifyOtp = [
  body('mobile')
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Enter a valid 10-digit Indian mobile number'),
  body('otp')
    .trim()
    .isLength({ min: 4, max: 6 })
    .isNumeric()
    .withMessage('OTP must be 4-6 digits'),
  validate,
];

const validateAdminLogin = [
  body('email').isEmail().withMessage('Enter a valid email address').toLowerCase(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  validate,
];

// --- Profile Validators ---
const validateProfile = [
  body('name').trim().isLength({ min: 2, max: 255 }).withMessage('Name must be 2-255 characters'),
  body('email').optional().isEmail().withMessage('Enter a valid email address'),
  body('dob').optional().isDate().withMessage('Enter a valid date of birth'),
  validate,
];

// --- Partner Registration Validators ---
const validatePartnerRegister = [
  body('org_name').trim().isLength({ min: 2, max: 255 }).withMessage('Organization name is required'),
  body('contact_name').trim().isLength({ min: 2, max: 255 }).withMessage('Contact person name is required'),
  body('mobile')
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Enter a valid 10-digit Indian mobile number'),
  body('org_type').notEmpty().withMessage('Organization type is required'),
  body('state').notEmpty().withMessage('State is required'),
  validate,
];

// --- Question Validators ---
const validateQuestion = [
  body('trade_id').isInt({ min: 1 }).withMessage('Valid trade ID is required'),
  body('question_text').trim().isLength({ min: 10 }).withMessage('Question text must be at least 10 characters'),
  body('option_a').trim().notEmpty().withMessage('Option A is required'),
  body('option_b').trim().notEmpty().withMessage('Option B is required'),
  body('option_c').trim().notEmpty().withMessage('Option C is required'),
  body('option_d').trim().notEmpty().withMessage('Option D is required'),
  body('correct_answer').isIn(['A', 'B', 'C', 'D']).withMessage('Correct answer must be A, B, C, or D'),
  body('difficulty').isIn(['easy', 'medium', 'hard']).withMessage('Difficulty must be easy, medium, or hard'),
  validate,
];

module.exports = {
  validate,
  validateSendOtp,
  validateVerifyOtp,
  validateAdminLogin,
  validateProfile,
  validatePartnerRegister,
  validateQuestion,
};
