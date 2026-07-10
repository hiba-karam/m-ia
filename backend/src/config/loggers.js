const { sql } = require('./db');

const logApiRequest = async (req, res, next) => {
    try {
        const request = new sql.Request();
        await request.query(`
            INSERT INTO msupport_api_logs (endpoint, method, timestamp)
            VALUES ('${req.originalUrl}', '${req.method}', GETDATE())
        `);
    } catch (error) {
        console.error(error);
    }
    next();
};

module.exports = logApiRequest;