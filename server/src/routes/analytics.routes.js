const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const authenticate = require('../middleware/authenticate');

router.get('/:ticker', authenticate, analyticsController.getAnalytics);

module.exports = router;