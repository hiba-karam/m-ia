const sql = require('mssql');
require('dotenv').config();

let pool = null;

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'M_IA_DB',
    options: {
        encrypt: process.env.DB_ENCRYPT !== 'false',
        enableArithAbort: true,
        trustServerCertificate: process.env.DB_TRUST_CERT !== 'false',
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000,
    },
};

async function connectDB() {
    if (pool) return pool;
    if (!dbConfig.user || !dbConfig.password) {
        throw new Error('Configuration SQL Server incomplète (DB_USER, DB_PASSWORD).');
    }
    pool = await sql.connect(dbConfig);
    return pool;
}

async function getPool() {
    return connectDB();
}

async function query(text, params = {}) {
    const connection = await getPool();
    const request = connection.request();
    Object.entries(params).forEach(([key, value]) => {
        request.input(key, value);
    });
    return request.query(text);
}

module.exports = { sql, connectDB, getPool, query };
