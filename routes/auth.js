const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const authController = require('../controllers/auth');

// Route for user signup
router.post('/signup', authController.signup);

// Route for user login
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.put('/updateBasic', authMiddleware.authenticateUser, authController.updateBasic);
router.put('/updateSecurity', authMiddleware.authenticateUser, authController.updateSecurity);
router.put('/updatePaymentInfo', authMiddleware.authenticateUser, authController.updatePaymentInfo);

router.post('/updateUserToSeller', authMiddleware.authenticateUser, authController.updateUserToSeller);
module.exports = router;
