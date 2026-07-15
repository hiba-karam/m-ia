// backend/src/config/db.js
const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: false, // Requis si pas de SSL
        enableArithAbort: true,
        trustServerCertificate: true // Requis pour les connexions locales
    }
};

const connectDB = async () => {
    try {
        await sql.connect(config);
        console.log("✅ Connexion a la base de donnees SQL Server reussie !");
    } catch (err) {
        console.error("❌ Erreur de connexion SQL Server : ", err);
    }
};

// On exporte uniquement l'objet 'sql' et la fonction 'connectDB'
module.exports = { sql, connectDB };
