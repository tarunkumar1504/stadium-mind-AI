/**
 * @file auth.js (routes)
 * @description Authentication routes for StadiumPulse AI.
 *
 * Endpoints:
 *   POST /api/auth/register  – Create a new account
 *   POST /api/auth/login     – Authenticate and receive a JWT
 *   GET  /api/auth/me        – Return current user (requires valid JWT)
 *
 * @module routes/auth
 */

'use strict';

const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// ---------------------------------------------------------------------------
// Validation chains
// ---------------------------------------------------------------------------

const registerValidation = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required.')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters.'),

  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Please provide a valid email address.'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long.')
    .matches(/\d/)
    .withMessage('Password must contain at least one number.'),

  body('role')
    .optional()
    .isIn(['fan', 'organizer'])
    .withMessage('Role must be either "fan" or "organizer".'),
];

const loginValidation = [
  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Please provide a valid email address.'),

  body('password')
    .notEmpty()
    .withMessage('Password is required.'),
];

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/**
 * @route  POST /api/auth/register
 * @access Public
 */
router.post('/register', apiLimiter, registerValidation, authController.register);

/**
 * @route  POST /api/auth/login
 * @access Public
 */
router.post('/login', apiLimiter, loginValidation, authController.login);

/**
 * @route  GET /api/auth/me
 * @access Private – requires valid JWT
 */
router.get('/me', authMiddleware(), authController.getMe);

module.exports = router;
