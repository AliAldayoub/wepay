const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const paymentController = require('../controllers/payment');

router.post('/addPayment', authMiddleware.authenticateUser, paymentController.addPayment);
router.get('/getAllPayments', authMiddleware.authenticateUser, paymentController.getAllPayments);
router.delete('/deletePayment/:id', authMiddleware.authenticateUser, paymentController.deletePayment);
module.exports = router;
