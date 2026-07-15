const { sql } = require('../../config/db');

const getProviders = async (req, res) => {
    try {
        const request = new sql.Request();
        const result = await request.query(`SELECT * FROM ai_providers`);
        res.status(200).json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur." });
    }
};

const getQuotas = async (req, res) => {
    try {
        const request = new sql.Request();
        const result = await request.query(`SELECT * FROM token_policies`);
        res.status(200).json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur." });
    }
};

module.exports = { getProviders, getQuotas };