const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stock.controller');
const authenticate = require('../middleware/authenticate');


router.get('/', authenticate, stockController.getStocks);
router.get('/:ticker', authenticate, stockController.getStock);

module.exports = router;