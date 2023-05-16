const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const paymentController = require('../controllers/payment');

router.post('/addPayment', authMiddleware.authenticateUser, authMiddleware.haveToken, paymentController.addPayment);
router.get(
	'/getAllPayments',
	authMiddleware.authenticateUser,
	authMiddleware.haveToken,
	paymentController.getAllPayments
);
router.delete(
	'/deletePayment/:id',
	authMiddleware.authenticateUser,
	authMiddleware.haveToken,
	paymentController.deletePayment
);
module.exports = router;
