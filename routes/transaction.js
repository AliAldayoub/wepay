const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const transactionController = require('../controllers/transaction');

const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post(
	'/depositRequest',
	authMiddleware.authenticateUser,
	upload.single('processImageUrl'),
	transactionController.depositRequest
);
router.post('/withdrawRequest', authMiddleware.authenticateUser, transactionController.withdrawRequest);

router.post('/transferMoney', authMiddleware.authenticateUser, transactionController.transferMoney);

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
module.exports = router;
