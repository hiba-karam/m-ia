const { sql } = require('../../config/db');

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

module.exports = { createTicketDraft };