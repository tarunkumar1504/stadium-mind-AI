const express = require('express');
const aiController = require('../controllers/aiController');
const { apiLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Chat with Gemini Assistant (Rate limited for API protection)
router.post('/chat', apiLimiter, aiController.askAssistant);

module.exports = router;
