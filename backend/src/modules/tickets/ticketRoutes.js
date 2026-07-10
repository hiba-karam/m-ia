const express = require('express');
const router = express.Router();
const ticketController = require('./ticketController');
const verifyToken = require('../../middlewares/authMiddleware');

router.post('/draft', verifyToken, ticketController.createTicketDraft);

module.exports = router;