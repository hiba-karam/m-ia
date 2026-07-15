const { sql } = require('../../config/db'); // SQL Server officiel
const axios = require('axios');

const MSUPPORT_API_URL = process.env.MSUPPORT_API_URL || 'https://api.msupport.entreprise.com/v1/tickets';
const MSUPPORT_API_KEY = process.env.MSUPPORT_API_KEY || 'dummy_key';

// Fonction de mapping pour adapter le format interne M-IA vers le format externe M-support
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
    // 1. Validation de base
    if (!data.emailMessageId || !data.ticket || !data.ai || data.ai.confidence === undefined) {
        throw new Error("Payload invalide : emailMessageId, ticket, et ai.confidence sont obligatoires.");
    }

    const score = parseFloat(data.ai.confidence);
    const title = data.ticket.title;
    const emailId = data.emailMessageId;

    let decisionStatus = 'manual';
    let externalTicketId = null;

    // 2. Décision Métier basée sur le score
    if (score >= 0.85) {
        decisionStatus = 'auto_created';
        
        // Mapping
        const externalPayload = mapToExternalPayload(data);
        
        // Appel API externe M-support avec système de Retry (Résilience)
        let attempt = 0;
        const maxRetries = 3;
        let success = false;
        
        while (attempt < maxRetries && !success) {
            try {
                attempt++;
                // Décommentez ceci pour l'appel réel
                /*
                const response = await axios.post(MSUPPORT_API_URL, externalPayload, {
                    headers: { 'Authorization': `Bearer ${MSUPPORT_API_KEY}` },
                    timeout: 5000
                });
                externalTicketId = response.data.ticketId;
                */
                
                // Simulation de réussite
                externalTicketId = `EXT-TICKET-${Math.floor(Math.random() * 100000)}`;
                console.log(`[M-support API] Succès: Ticket créé dans l'outil externe (${externalTicketId}) à la tentative ${attempt}`);
                success = true;
                
            } catch (error) {
                console.warn(`[M-support API] Échec tentative ${attempt}/${maxRetries} :`, error.message);
                if (attempt >= maxRetries) {
                    decisionStatus = 'failed_api';
                    console.error("[M-support API] Abandon : L'API externe M-support est injoignable.");
                } else {
                    // Attente de 1 seconde avant le prochain essai (backoff simple)
                    await new Promise(res => setTimeout(res, 1000));
                }
            }
        }
    } else if (score >= 0.60 && score < 0.85) {
        decisionStatus = 'to_qualify';
        console.log(`[M-support API] Score moyen (${score}): En attente de qualification humaine.`);
    } else {
        decisionStatus = 'manual';
        console.log(`[M-support API] Score faible (${score}): Traitement manuel requis.`);
    }

    // 3. Insertion SQL locale (pour 5. Enregistrement local M-IA avec la bonne syntaxe mssql
    const sqlQueryTickets = `
        INSERT INTO tickets (email_message_id, title, status, msupport_ticket_id) 
        OUTPUT INSERTED.id
        VALUES (@emailId, @title, @decisionStatus, @externalTicketId)
    `;
    
    const request = new sql.Request();
    request.input('emailId', sql.Int, emailId);
    request.input('title', sql.NVarChar, title);
    request.input('decisionStatus', sql.NVarChar, decisionStatus);
    request.input('externalTicketId', sql.NVarChar, externalTicketId);
    
    const result = await request.query(sqlQueryTickets);
    const internalId = result.recordset[0].id;

    // Journalisation de la requête vers l'API externe (table msupport_api_logs)
    if (score >= 0.85) {
        const sqlQueryLogs = `
            INSERT INTO msupport_api_logs 
            (ticket_id, endpoint_url, request_payload, response_status, error_message) 
            VALUES (@internalId, @url, @payload, @status, @errorMsg)
        `;
        const logReq = new sql.Request();
        logReq.input('internalId', sql.Int, internalId);
        logReq.input('url', sql.NVarChar, MSUPPORT_API_URL);
        logReq.input('payload', sql.NVarChar, JSON.stringify(mapToExternalPayload(data)));
        logReq.input('status', sql.NVarChar, decisionStatus === 'auto_created' ? '201' : '500');
        logReq.input('errorMsg', sql.NVarChar, null);
        
        await logReq.query(sqlQueryLogs);
    }
    
    // 4. Accusé de réception (Mock)
    if (decisionStatus === 'auto_created' && externalTicketId) {
        console.log(`[Email Mock] ✉️ Envoi d'un accusé de réception à ${data.requester?.email || 'l\'utilisateur'}. Motif: Ticket officiel généré ${externalTicketId}.`);
    }

    return {
        internalId: result.insertId,
        externalId: externalTicketId,
        status: decisionStatus,
        confidenceScore: score,
        message: decisionStatus === 'auto_created' 
            ? "Ticket automatiquement créé dans M-support." 
            : "Ticket enregistré localement pour qualification humaine."
    };
};

module.exports = { processTicket };