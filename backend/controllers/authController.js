const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const db = require('../config/db');

// Helper to sign JWT
const signToken = (user) => {
  return jwt.sign(
    { id: user.id || user._id, username: user.username, role: user.role },
    process.env.JWT_SECRET || 'supersecretfifaworldcup2026stadiumpulsekey',
    { expiresIn: '24h' }
  );
};

exports.register = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, email, password, role } = req.body;

  try {
    const assignedRole = role === 'organizer' ? 'organizer' : 'fan';

    if (db.isMockDB()) {
      const mockData = db.readMockDB();
      const existingUser = mockData.users.find(u => u.email === email || u.username === username);
      if (existingUser) {
        return res.status(400).json({ message: 'User with this email or username already exists' });
      }

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const newUser = {
        id: `mock_user_${Date.now()}`,
        username,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: assignedRole,
        createdAt: new Date().toISOString()
      };

      mockData.users.push(newUser);
      db.writeMockDB(mockData);

      const token = signToken(newUser);
      return res.status(201).json({
        token,
        user: { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role }
      });
    } else {
      let user = await User.findOne({ $or: [{ email }, { username }] });
      if (user) {
        return res.status(400).json({ message: 'User with this email or username already exists' });
      }

      user = new User({
        username,
        email,
        password,
        role: assignedRole
      });

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const token = signToken(user);
      return res.status(201).json({
        token,
        user: { id: user._id, username: user.username, email: user.email, role: user.role }
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    if (db.isMockDB()) {
      const mockData = db.readMockDB();
      const user = mockData.users.find(u => u.email === email.toLowerCase());
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = signToken(user);
      return res.json({
        token,
        user: { id: user.id, username: user.username, email: user.email, role: user.role }
      });
    } else {
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }

      const token = signToken(user);
      return res.json({
        token,
        user: { id: user._id, username: user.username, email: user.email, role: user.role }
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    if (db.isMockDB()) {
      const mockData = db.readMockDB();
      const user = mockData.users.find(u => u.id === req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      });
    } else {
      const user = await User.findById(req.user.id).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.json(user);
    }
  } catch (err) {
    next(err);
  }
};
