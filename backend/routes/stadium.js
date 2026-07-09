const express = require('express');
const stadiumController = require('../controllers/stadiumController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// 1. POI routes
router.get('/points', stadiumController.getPoints);
router.put('/points/:id', stadiumController.updatePoint);

// 2. Active alerts routes
router.get('/alerts', stadiumController.getAlerts);
router.post('/alerts', authMiddleware('organizer'), stadiumController.createAlert);
router.put('/alerts/:id/dismiss', authMiddleware('organizer'), stadiumController.dismissAlert);

// 3. Dijkstra pathfinder route
router.get('/route', stadiumController.getRoute);

module.exports = router;
