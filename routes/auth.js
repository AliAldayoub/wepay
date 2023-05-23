const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const authController = require('../controllers/auth');

// Route for user signup
router.post('/signup', authController.signup);

// Route for user login
router.post('/login', authController.login);
// router.post('/logout', authController.logout);

router.put('/updateBasic', authMiddleware.authenticateUser, authMiddleware.haveToken, authController.updateBasic);
router.put('/updateSecurity', authMiddleware.authenticateUser, authMiddleware.haveToken, authController.updateSecurity);
router.put(
	'/updatePaymentInfo',
	authMiddleware.authenticateUser,
	authMiddleware.haveToken,
	authController.updatePaymentInfo
);

router.post(
	'/updateUserToSeller',
	authMiddleware.authenticateUser,
	authMiddleware.haveToken,
	authController.updateUserToSeller
);

router.post('/updateUserToAdmin', authController.updateUserToAdmin);
router.post('/resetPassword', authController.resetPassword);
router.get('/getUserInfo', authMiddleware.authenticateUser, authMiddleware.haveToken, authController.getUserInfo);
module.exports = router;
