const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_NAME,
    options: {
        encrypt: false,
        enableArithAbort: true,
        trustServerCertificate: true
    }
};

const connectDB = async () => {
    try {
        await sql.connect(config);
        console.log("Connexion à la base de données SQL Server réussie !");
    } catch (err) {
        console.error("Erreur de connexion SQL Server : ", err);
    }
};

module.exports = { sql, connectDB };