const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const transactionController = require('../controllers/transaction');

router.post('/depositRequest', authMiddleware.authenticateUser, transactionController.depositRequest);
router.post('/withdrawRequest', authMiddleware.authenticateUser, transactionController.withdrawRequest);

module.exports = router;
