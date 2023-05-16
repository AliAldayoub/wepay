const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const transactionController = require('../controllers/transaction');

router.post(
	'/depositRequest',
	authMiddleware.authenticateUser,
	authMiddleware.haveToken,
	transactionController.depositRequest
);
router.post(
	'/withdrawRequest',
	authMiddleware.authenticateUser,
	authMiddleware.haveToken,
	transactionController.withdrawRequest
);

router.post(
	'/transferMoney',
	authMiddleware.authenticateUser,
	authMiddleware.haveToken,
	transactionController.transferMoney
);

router.get('/getActions', authMiddleware.authenticateUser, authMiddleware.haveToken, transactionController.getActions);

router.put(
	'/depositResponse/:id',
	authMiddleware.authenticateUser,
	authMiddleware.haveToken,
	authMiddleware.authenticateAdmin,
	transactionController.depositResponse
);

router.put(
	'/withdrawResponse/:id',
	authMiddleware.authenticateUser,
	authMiddleware.haveToken,
	authMiddleware.authenticateAdmin,
	transactionController.withdrawResponse
);
module.exports = router;
