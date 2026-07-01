const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolio.controller');
const authenticate = require('../middleware/authenticate');

router.get('/', authenticate, portfolioController.getMyPortfolio);

module.exports = router;