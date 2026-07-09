const jwt = require('jsonwebtoken');

const auth = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    // Get token from header
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: 'No authorization token, access denied' });
    }

    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Malformed authorization token, access denied' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretfifaworldcup2026stadiumpulsekey');
      req.user = decoded;

      // Check if role is authorized
      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }

      next();
    } catch (err) {
      res.status(401).json({ message: 'Token is invalid or expired' });
    }
  };
};

module.exports = auth;
