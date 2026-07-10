const express = require('express');
const router = express.Router();
const msupportController = require('./msupportController');
const verifyToken = require('../../middlewares/authMiddleware');

router.post('/process', verifyToken, async (req, res) => {
    try {
        const result = await msupportController.processTicket(req.body);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;