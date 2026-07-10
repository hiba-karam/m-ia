const express = require('express');
const { sync, list, getById } = require('./email.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');

const router = express.Router();

router.post('/emails/sync', authenticate(), authorize('tickets:write', '*'), sync);
router.get('/emails', authenticate(), authorize('tickets:read', '*'), list);
router.get('/emails/:id', authenticate(), authorize('tickets:read', '*'), getById);

module.exports = router;
