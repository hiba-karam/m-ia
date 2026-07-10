const express = require('express');
const { sync, list, getById } = require('./emailController');
const { verifyToken, authorize } = require('../../middlewares/authMiddleware');

const router = express.Router();

router.post('/emails/sync', verifyToken, authorize('tickets:write', '*'), sync);
router.get('/emails', verifyToken, authorize('tickets:read', '*'), list);
router.get('/emails/:id', verifyToken, authorize('tickets:read', '*'), getById);

module.exports = router;
