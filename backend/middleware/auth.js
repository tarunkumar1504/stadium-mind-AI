/**
 * @file auth.js (middleware)
 * @description JWT authentication middleware for StadiumPulse AI.
 *
 * Validates the Bearer token, attaches decoded payload to `req.user`,
 * and enforces role-based access control (RBAC).
 *
 * Error response shape:
 *   { error: string, code: number }
 *
 * @module middleware/auth
 */

'use strict';

const jwt = require('jsonwebtoken');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Fallback secret – only used when JWT_SECRET env var is absent (dev/test). */
const FALLBACK_SECRET = 'supersecretfifaworldcup2026stadiumpulsekey';

/**
 * Extracts the Bearer token from the Authorization header.
 *
 * @param {string|undefined} authHeader
 * @returns {string|null} The raw token string, or null if absent / malformed.
 */
function extractBearerToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  return token.length > 0 ? token : null;
}

// ---------------------------------------------------------------------------
// Middleware factory
// ---------------------------------------------------------------------------

/**
 * Creates an Express middleware that validates a JWT and enforces roles.
 *
 * @param {string|string[]} [roles=[]] - Allowed roles. Empty array = any authenticated user.
 * @returns {import('express').RequestHandler}
 *
 * @example
 * router.get('/protected', auth(['organizer']), handler);
 * router.get('/any-user',  auth(),              handler);
 */
const auth = (roles = []) => {
  // Normalise to array once, not on every request
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    // 1. Extract token
    const token = extractBearerToken(req.headers['authorization']);
    if (!token) {
      return res
        .status(401)
        .json({ error: 'No authorization token provided.', code: 401 });
    }

    // 2. Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || FALLBACK_SECRET);
    } catch (err) {
      const isExpired = err.name === 'TokenExpiredError';
      return res.status(401).json({
        error: isExpired
          ? 'Session expired. Please log in again.'
          : 'Invalid authorization token.',
        code: 401,
      });
    }

    // 3. Enforce RBAC
    if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
      return res.status(403).json({
        error: 'You do not have permission to perform this action.',
        code: 403,
      });
    }

    // 4. Attach user payload and continue
    req.user = decoded;
    next();
  };
};

module.exports = auth;
