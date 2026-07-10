const { sql } = require('../../config/db'); 
const axios = require('axios');

const MSUPPORT_API_URL = process.env.MSUPPORT_API_URL || 'https://api.msupport.entreprise.com/v1/tickets';
const MSUPPORT_API_KEY = process.env.MSUPPORT_API_KEY || 'dummy_key';

const mapToExternalPayload = (internalData) => {
    return {
        m_support_title: internalData.ticket.title,
        m_support_description: internalData.ticket.description || "Description non fournie",
        category_code: internalData.ticket.category,
        urgency_level: internalData.ticket.urgency,
        impact_level: internalData.ticket.impact,
        reporter_email: internalData.requester?.email || "inconnu@entreprise.com",
        origin: "M-IA_Automation"
    };
};

const processTicket = async (data) => {
    if (!data.emailMessageId || !data.ticket || !data.ai || data.ai.confidence === undefined) {
        throw new Error("Payload invalide : emailMessageId, ticket, et ai.confidence sont obligatoires.");
    }

    const score = parseFloat(data.ai.confidence);
    const title = data.ticket.title;
    const emailId = data.emailMessageId;

    let decisionStatus = 'manual';
    let externalTicketId = null;

    if (score >= 0.85) {
        decisionStatus = 'auto_created';
        const externalPayload = mapToExternalPayload(data);
        
        let attempt = 0;
        const maxRetries = 3;
        let success = false;
        
        while (attempt < maxRetries && !success) {
            try {
                attempt++;
                // Appel réel vers l'API externe M-support
                const apiResponse = await axios.post(MSUPPORT_API_URL, externalPayload, {
                    headers: {
                        'Authorization': `Bearer ${MSUPPORT_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 5000 // 5 secondes max
                });

                externalTicketId = apiResponse.data.ticket_id || `EXT-TICKET-${Math.floor(Math.random() * 100000)}`;
                console.log(`[M-support API] Succès: Ticket créé dans l'outil externe (${externalTicketId}) à la tentative ${attempt}`);
                success = true;
            } catch (error) {
                console.warn(`[M-support API] Échec tentative ${attempt}/${maxRetries} :`, error.message);
                if (attempt >= maxRetries) {
                    decisionStatus = 'failed_api';
                } else {
                    await new Promise(res => setTimeout(res, 1000));
                }
            }
        }
    } else if (score >= 0.60 && score < 0.85) {
        decisionStatus = 'to_qualify';
    }

    const request = new sql.Request();
    request.input('email_message_id', sql.BigInt, emailId);
    request.input('title', sql.NVarChar, title);
    request.input('status', sql.NVarChar, decisionStatus);
    request.input('msupport_ticket_id', sql.NVarChar, externalTicketId);

    const result = await request.query(`
        INSERT INTO tickets (email_message_id, title, status, msupport_ticket_id)
        OUTPUT INSERTED.id
        VALUES (@email_message_id, @title, @status, @msupport_ticket_id)
    `);
    const internalTicketId = result.recordset[0].id;

    if (score >= 0.85) {
        const statusCode = decisionStatus === 'auto_created' ? 201 : 500;
        const logRequest = new sql.Request();
        logRequest.input('ticket_id', sql.BigInt, internalTicketId);
        logRequest.input('status_code', sql.Int, statusCode);
        logRequest.input('request_json', sql.NVarChar(sql.MAX), JSON.stringify(mapToExternalPayload(data)));
        logRequest.input('response_json', sql.NVarChar(sql.MAX), JSON.stringify({ simulated_response: "ok", ticket_id: externalTicketId }));

        await logRequest.query(`
            INSERT INTO msupport_api_logs (ticket_id, status_code, request_json, response_json)
            VALUES (@ticket_id, @status_code, @request_json, @response_json)
        `);
    }
    
    return {
        internalId: internalTicketId,
        externalId: externalTicketId,
        status: decisionStatus,
        confidenceScore: score,
        message: decisionStatus === 'auto_created' ? "Ticket automatiquement créé." : "Ticket enregistré localement."
    };
};

module.exports = { processTicket };