const express = require('express');
const router = express.Router();
const tokenController = require('./tokenController');
const verifyToken = require('../../middlewares/authMiddleware');

router.post('/check', verifyToken, tokenController.checkQuota);

module.exports = router;