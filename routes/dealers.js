const express = require('express');
const router = express.Router();

const dealersController = require('../controllers/dealers');
router.get('/getAllDealers', dealersController.getAllDealers);

module.exports = router;
