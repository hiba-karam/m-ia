const express = require('express');
const router = express.Router();
const adminController = require('./adminController');
const { verifyToken } = require('../../middlewares/authMiddleware');

router.get('/providers', verifyToken, adminController.getProviders);
router.get('/quotas', verifyToken, adminController.getQuotas);
router.get('/roles', verifyToken, adminController.getRoles);
router.get('/mailbox', verifyToken, adminController.getMailboxSettings);

module.exports = router;