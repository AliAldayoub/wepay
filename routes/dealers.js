const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const dealersController = require('../controllers/dealers');
router.get('/getAllDealers', dealersController.getAllDealers);
router.post(
	'/addDealer',
	authMiddleware.authenticateUser,
	authMiddleware.authenticateAdmin,
	dealersController.addDealer
);

module.exports = router;
