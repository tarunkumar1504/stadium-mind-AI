const StadiumPoint = require('../models/StadiumPoint');
const Alert = require('../models/Alert');
const db = require('../config/db');
const { findShortestPath } = require('../utils/stadiumGraph');
const { validationResult } = require('express-validator');

// Helper to determine status based on crowd level
const getStatusForCrowd = (level) => {
  if (level <= 30) return 'clear';
  if (level <= 60) return 'moderate';
  if (level <= 85) return 'congested';
  return 'critical';
};

// 1. Get all points of interest (POI)
exports.getPoints = async (req, res, next) => {
  try {
    if (db.isMockDB()) {
      const mockData = db.readMockDB();
      return res.json(mockData.stadiumPoints);
    } else {
      const points = await StadiumPoint.find({});
      // If DB is empty, initialize default points
      if (points.length === 0) {
        const defaults = db.getDefaultStadiumPoints();
        const saved = await StadiumPoint.insertMany(defaults);
        return res.json(saved);
      }
      return res.json(points);
    }
  } catch (err) {
    next(err);
  }
};

// 2. Update a specific point (e.g. simulation or staff input)
exports.updatePoint = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { crowdLevel, queueSize } = req.body;

  try {
    const level = parseInt(crowdLevel);
    const size = parseInt(queueSize);
    const status = getStatusForCrowd(level);

    if (db.isMockDB()) {
      const mockData = db.readMockDB();
      const pointIndex = mockData.stadiumPoints.findIndex(p => p.id === id);
      if (pointIndex === -1) {
        return res.status(404).json({ message: 'Stadium point not found' });
      }

      mockData.stadiumPoints[pointIndex] = {
        ...mockData.stadiumPoints[pointIndex],
        crowdLevel: level,
        queueSize: size,
        status,
        updatedAt: new Date().toISOString()
      };

      db.writeMockDB(mockData);
      return res.json(mockData.stadiumPoints[pointIndex]);
    } else {
      const point = await StadiumPoint.findOneAndUpdate(
        { id },
        { crowdLevel: level, queueSize: size, status, updatedAt: Date.now() },
        { new: true }
      );
      if (!point) {
        return res.status(404).json({ message: 'Stadium point not found' });
      }
      return res.json(point);
    }
  } catch (err) {
    next(err);
  }
};

// 3. Get alerts
exports.getAlerts = async (req, res, next) => {
  try {
    if (db.isMockDB()) {
      const mockData = db.readMockDB();
      return res.json(mockData.alerts.filter(a => a.active));
    } else {
      const alerts = await Alert.find({ active: true }).sort({ timestamp: -1 });
      return res.json(alerts);
    }
  } catch (err) {
    next(err);
  }
};

// 4. Create alert (Organizer only)
exports.createAlert = async (req, res, next) => {
  const { type, message, source } = req.body;

  try {
    const newAlertData = {
      type: type || 'info',
      message,
      source: source || 'Organizer Control',
      timestamp: new Date().toISOString(),
      active: true
    };

    if (db.isMockDB()) {
      const mockData = db.readMockDB();
      const newAlert = {
        id: `alert_${Date.now()}`,
        ...newAlertData
      };
      mockData.alerts.unshift(newAlert);
      db.writeMockDB(mockData);
      return res.status(201).json(newAlert);
    } else {
      const alert = new Alert(newAlertData);
      await alert.save();
      return res.status(201).json(alert);
    }
  } catch (err) {
    next(err);
  }
};

// 5. Dismiss alert
exports.dismissAlert = async (req, res, next) => {
  const { id } = req.params;

  try {
    if (db.isMockDB()) {
      const mockData = db.readMockDB();
      const alertIndex = mockData.alerts.findIndex(a => a.id === id || a._id === id);
      if (alertIndex === -1) {
        return res.status(404).json({ message: 'Alert not found' });
      }
      mockData.alerts[alertIndex].active = false;
      db.writeMockDB(mockData);
      return res.json({ message: 'Alert dismissed successfully' });
    } else {
      const alert = await Alert.findByIdAndUpdate(id, { active: false }, { new: true });
      if (!alert) {
        return res.status(404).json({ message: 'Alert not found' });
      }
      return res.json({ message: 'Alert dismissed successfully' });
    }
  } catch (err) {
    next(err);
  }
};

// 6. Find path route using current crowd values
exports.getRoute = async (req, res, next) => {
  const { start, end, accessibility } = req.query;
  const isAccessible = accessibility === 'true';

  if (!start || !end) {
    return res.status(400).json({ message: 'Start and end nodes are required' });
  }

  try {
    let crowdWeights = {};

    if (db.isMockDB()) {
      const mockData = db.readMockDB();
      mockData.stadiumPoints.forEach(p => {
        crowdWeights[p.id] = p.crowdLevel;
      });
    } else {
      const points = await StadiumPoint.find({});
      points.forEach(p => {
        crowdWeights[p.id] = p.crowdLevel;
      });
    }

    const routeResult = findShortestPath(start, end, crowdWeights, isAccessible);
    if (!routeResult) {
      return res.status(404).json({ message: 'No viable route found matching current filters.' });
    }

    return res.json(routeResult);
  } catch (err) {
    next(err);
  }
};
