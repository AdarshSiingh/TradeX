const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const authenticate = require('../middleware/authenticate');

router.get('/', authenticate, transactionController.getTransactions);

module.exports = router;