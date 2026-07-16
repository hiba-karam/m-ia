const { sql } = require('../../config/db');

const listTickets = async (req, res) => {
    try {
        const request = new sql.Request();
        const result = await request.query(`
            SELECT 
                t.id, t.title, t.status, t.msupport_ticket_id,
                t.created_at, t.updated_at,
                e.subject as email_subject,
                e.sender_email as email_from,
                e.received_at as email_date
            FROM tickets t
            LEFT JOIN email_messages e ON e.id = t.email_message_id
            ORDER BY t.created_at DESC
        `);
        res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Erreur SQL lors du listage des tickets :", error);
        res.status(500).json({ message: "Erreur serveur." });
    }
};

const createTicketDraft = async (req, res) => {
    try {
        const { title } = req.body;
        const request = new sql.Request();
        
        request.input('title', sql.NVarChar, title);
        request.input('status', sql.NVarChar, 'draft');

        await request.query(`
            INSERT INTO tickets (title, status)
            VALUES (@title, @status)
        `);
        
        res.status(201).json({ message: "Brouillon de ticket créé." });
    } catch (error) {
        console.error("Erreur SQL lors de la création du ticket :", error); 
        res.status(500).json({ message: "Erreur serveur." });
    }
};

module.exports = { listTickets, createTicketDraft };