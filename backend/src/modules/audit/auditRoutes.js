const express = require('express');
const router = express.Router();
const auditController = require('./auditController');
const verifyToken = require('../../middlewares/authMiddleware');

router.get('/', verifyToken, auditController.getAuditLogs);

module.exports = router;