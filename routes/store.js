const express = require('express');
const router = express.Router();
const storeController = require('../controllers/store');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/getAllStores', authMiddleware.authenticateUser, storeController.getAllStores);

module.exports = router;
