const { sql } = require('./db');

const logApiRequest = async (req, res, next) => {
    try {
        const request = new sql.Request();
        await request.query(`
            INSERT INTO audit_logs (action, details, ip_address)
            VALUES ('API_REQUEST', '{"endpoint":"${req.originalUrl}","method":"${req.method}"}', '${req.ip || ''}')
        `);
    } catch (error) {
        console.error(error);
    }
    next();
};

module.exports = logApiRequest;