const express = require('express');
const { body, param } = require('express-validator');
const stadiumController = require('../controllers/stadiumController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const updatePointValidation = [
  param('id')
    .trim()
    .notEmpty()
    .withMessage('Point ID is required.'),
  body('crowdLevel')
    .isInt({ min: 0, max: 100 })
    .withMessage('Crowd level must be an integer between 0 and 100.'),
  body('queueSize')
    .isInt({ min: 0 })
    .withMessage('Queue size must be a non-negative integer.')
];

// 1. POI routes
router.get('/points', stadiumController.getPoints);
router.put('/points/:id', authMiddleware('organizer'), updatePointValidation, stadiumController.updatePoint);

// 2. Active alerts routes
router.get('/alerts', stadiumController.getAlerts);
router.post('/alerts', authMiddleware('organizer'), stadiumController.createAlert);
router.put('/alerts/:id/dismiss', authMiddleware('organizer'), stadiumController.dismissAlert);

// 3. Dijkstra pathfinder route
router.get('/route', stadiumController.getRoute);

module.exports = router;
