const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

router.get('/',authController.hello)

module.exports = router;