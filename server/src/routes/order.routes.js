const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const authenticate = require('../middleware/authenticate');

router.post('/buy', authenticate, orderController.buy);
router.post('/sell', authenticate, orderController.sell);

module.exports = router;