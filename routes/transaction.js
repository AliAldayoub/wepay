const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const transactionController = require('../controllers/transaction');

const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get('/getShipping', authMiddleware.authenticateUser, transactionController.getShipping);

router.get('/getDashboard', authMiddleware.authenticateUser, transactionController.getDashboard);
router.get('/getDaysChart', authMiddleware.authenticateUser, transactionController.getDaysChart);
router.get('/getHoursChart', authMiddleware.authenticateUser, transactionController.getHoursChart);

router.post(
	'/depositRequest',
	authMiddleware.authenticateUser,
	upload.single('processImageUrl'),
	transactionController.depositRequest
);
router.post('/withdrawRequest', authMiddleware.authenticateUser, transactionController.withdrawRequest);

router.post('/transferMoney', authMiddleware.authenticateUser, transactionController.transferMoney);
router.post('/payForShoppingo', authMiddleware.authenticateUser, transactionController.payForShoppingo);

router.get('/getActions', authMiddleware.authenticateUser, transactionController.getActions);

router.put(
	'/depositResponse/:id',
	authMiddleware.authenticateUser,
	authMiddleware.authenticateAdmin,
	transactionController.depositResponse
);

router.put(
	'/withdrawResponse/:id',
	authMiddleware.authenticateUser,
	authMiddleware.authenticateAdmin,
	transactionController.withdrawResponse
);

router.get(
	'/getAllDepositRequest',
	authMiddleware.authenticateUser,
	authMiddleware.authenticateAdmin,
	transactionController.getAllDepositRequest
);

router.get(
	'/getAllWithdrawRequest',
	authMiddleware.authenticateUser,
	authMiddleware.authenticateAdmin,
	transactionController.getAllWithdrawRequest
);
module.exports = router;
