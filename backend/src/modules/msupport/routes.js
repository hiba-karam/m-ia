const express = require('express');
const router = express.Router();
const service = require('./service');

router.post('/tickets', async (req, res) => {
    try {
        const result = await service.processTicket(req.body);
        res.status(201).json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

module.exports = router;