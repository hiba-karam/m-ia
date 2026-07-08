const { syncMailbox, listEmails, getEmailById } = require('./email.service');

async function sync(req, res) {
    try {
        const result = await syncMailbox();
        return res.json(result);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

async function list(req, res) {
    try {
        const { status, limit } = req.query;
        const emails = await listEmails({
            status,
            limit: limit ? parseInt(limit, 10) : 50,
        });
        return res.json({ count: emails.length, items: emails });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

async function getById(req, res) {
    try {
        const email = await getEmailById(parseInt(req.params.id, 10));
        if (!email) {
            return res.status(404).json({ error: 'Email introuvable.' });
        }
        return res.json(email);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}

module.exports = { sync, list, getById };
