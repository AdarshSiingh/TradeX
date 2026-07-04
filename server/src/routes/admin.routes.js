const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');


router.get('/users', authenticate, authorize('ADMIN'), adminController.getUsers);
router.patch('/users/:userId/toggle-status', authenticate, authorize('ADMIN'), adminController.suspendUser);
router.post('/stocks', authenticate, authorize('ADMIN'), adminController.createStock);
router.get('/stats', authenticate, authorize('ADMIN'), adminController.getStats);
router.delete('/stocks/:stockId', authenticate, authorize('ADMIN'), adminController.deleteStock);

module.exports = router;