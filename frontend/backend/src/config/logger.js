const { sql } = require('./db');

const logMsupportApi = async (ticketId, statusCode, requestJson, responseJson) => {
    try {
        const request = new sql.Request();
        request.input('ticketId', sql.BigInt, ticketId || null);
        request.input('statusCode', sql.Int, statusCode);
        request.input('requestJson', sql.NVarChar(sql.MAX), JSON.stringify(requestJson));
        request.input('responseJson', sql.NVarChar(sql.MAX), responseJson ? JSON.stringify(responseJson) : null);
        const query = `
            INSERT INTO msupport_api_logs (ticket_id, status_code, request_json, response_json)
            VALUES (@ticketId, @statusCode, @requestJson, @responseJson)
        `;
        await request.query(query);
        console.log('Trace d\'audit enregistree avec succes dans la BDD.');
        
    } catch (error) {
        console.error('Erreur critique lors de la sauvegarde du log:', error);
    }
};
module.exports = { logMsupportApi };