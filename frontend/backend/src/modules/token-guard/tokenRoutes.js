const express = require('express');
const router = express.Router();
const { checkTokenQuota } = require('./tokenController');
const verifyToken = require('../../middlewares/authMiddleware');
router.post('/check', verifyToken, checkTokenQuota);
module.exports = router;