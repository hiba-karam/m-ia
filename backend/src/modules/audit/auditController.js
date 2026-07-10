const { sql } = require('../../config/db');

const getAuditLogs = async (req, res) => {
    try {
        const request = new sql.Request();

        const result = await request.query(`
            SELECT 
                al.id, 
                al.action, 
                al.details, 
                al.ip_address, 
                al.created_at,
                u.email AS user_email
            FROM audit_logs al
            LEFT JOIN users u ON al.user_id = u.id
            ORDER BY al.created_at DESC
        `);

        res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Erreur SQL lors de la récupération de l'audit : ", error);
        res.status(500).json({ message: "Erreur serveur lors de la récupération de l'audit." });
    }
};

module.exports = { getAuditLogs };