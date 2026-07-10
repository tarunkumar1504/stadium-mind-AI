/**
 * @file authController.js
 * @description Authentication controller for StadiumPulse AI.
 *
 * Handles user registration, login, and retrieval of the current user.
 * Supports both MongoDB and the JSON mock-DB fallback.
 *
 * All responses follow a consistent shape:
 *   Success: { token: string, user: UserPublic }
 *   Error  : { message: string } | { errors: Array }
 *
 * @module controllers/authController
 */

'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const db = require('../config/db');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const JWT_EXPIRY = '24h';
const BCRYPT_ROUNDS = 10;
const FALLBACK_SECRET = 'supersecretfifaworldcup2026stadiumpulsekey';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Signs a JWT for the given user.
 *
 * @param {{ id?: string, _id?: string, username: string, role: string }} user
 * @returns {string} Signed JWT string.
 */
const signToken = (user) =>
  jwt.sign(
    { id: user.id ?? user._id?.toString(), username: user.username, role: user.role },
    process.env.JWT_SECRET || FALLBACK_SECRET,
    { expiresIn: JWT_EXPIRY }
  );

/**
 * Returns only the safe public fields of a user object.
 *
 * @param {{ id?: string, _id?: string, username: string, email: string, role: string }} user
 * @returns {{ id: string, username: string, email: string, role: string }}
 */
const toPublicUser = (user) => ({
  id: user.id ?? user._id?.toString(),
  username: user.username,
  email: user.email,
  role: user.role,
});

/**
 * Hashes a plain-text password.
 *
 * @param {string} password
 * @returns {Promise<string>}
 */
const hashPassword = (password) => bcrypt.hash(password, BCRYPT_ROUNDS);

// ---------------------------------------------------------------------------
// Controller: register
// ---------------------------------------------------------------------------

/**
 * POST /api/auth/register
 *
 * Creates a new user account and returns a JWT with the public user object.
 *
 * @type {import('express').RequestHandler}
 */
exports.register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password, role } = req.body;
  // Only allow the two valid roles; default to 'fan' for safety
  const assignedRole = role === 'organizer' ? 'organizer' : 'fan';

  try {
    if (db.isMockDB()) {
      const mockData = db.readMockDB();
      const normalised = email.toLowerCase();

      const exists = mockData.users.some(
        (u) => u.email === normalised || u.username === username
      );
      if (exists) {
        return res
          .status(409)
          .json({ message: 'A user with this email or username already exists.' });
      }

      const newUser = {
        id: `mock_user_${Date.now()}`,
        username,
        email: normalised,
        password: await hashPassword(password),
        role: assignedRole,
        createdAt: new Date().toISOString(),
      };

      mockData.users.push(newUser);
      db.writeMockDB(mockData);

      return res.status(201).json({ token: signToken(newUser), user: toPublicUser(newUser) });
    }

    // MongoDB path
    const exists = await User.exists({
      $or: [{ email: email.toLowerCase() }, { username }],
    });
    if (exists) {
      return res
        .status(409)
        .json({ message: 'A user with this email or username already exists.' });
    }

    const newUser = new User({
      username,
      email,
      password: await hashPassword(password),
      role: assignedRole,
    });
    await newUser.save();

    return res.status(201).json({ token: signToken(newUser), user: toPublicUser(newUser) });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// Controller: login
// ---------------------------------------------------------------------------

/**
 * POST /api/auth/login
 *
 * Validates credentials and returns a JWT with the public user object.
 *
 * @type {import('express').RequestHandler}
 */
exports.login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  const normalised = email.toLowerCase();

  try {
    let user;

    if (db.isMockDB()) {
      const mockData = db.readMockDB();
      user = mockData.users.find((u) => u.email === normalised);
    } else {
      user = await User.findOne({ email: normalised });
    }

    if (!user) {
      // Use a generic message to avoid leaking which field is incorrect
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    return res.json({ token: signToken(user), user: toPublicUser(user) });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// Controller: getMe
// ---------------------------------------------------------------------------

/**
 * GET /api/auth/me
 *
 * Returns the public profile of the currently authenticated user.
 *
 * @type {import('express').RequestHandler}
 */
exports.getMe = async (req, res, next) => {
  try {
    if (db.isMockDB()) {
      const mockData = db.readMockDB();
      const user = mockData.users.find((u) => u.id === req.user.id);
      if (!user) return res.status(404).json({ message: 'User not found.' });
      return res.json(toPublicUser(user));
    }

    const user = await User.findById(req.user.id).select('-password -__v').lean();
    if (!user) return res.status(404).json({ message: 'User not found.' });

    return res.json(user);
  } catch (err) {
    next(err);
  }
};
