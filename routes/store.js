const express = require('express');
const router = express.Router();
const storeController = require('../controllers/store');

router.get('/getAllStores', storeController.getAllStores);

module.exports = router;
