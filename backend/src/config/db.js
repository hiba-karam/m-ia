// backend/src/config/db.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'm_ai_bd', // Assure-toi que le nom correspond à ce que tu as dans phpMyAdmin
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = pool;