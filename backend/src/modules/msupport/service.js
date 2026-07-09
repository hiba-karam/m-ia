const pool = require('../../config/db'); // Votre connexion XAMPP
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

    // 3. Insertion SQL locale (pour garder une trace M-IA)
    const sql = 'INSERT INTO tickets (email_message_id, title, status, msupport_ticket_id) VALUES (?, ?, ?, ?)';
    const [result] = await pool.execute(sql, [emailId, title, decisionStatus, externalTicketId]);
    const internalTicketId = result.insertId;

    // Journalisation de la requête vers l'API externe (table msupport_api_logs)
    if (score >= 0.85) {
        const apiLogSql = 'INSERT INTO msupport_api_logs (ticket_id, status_code, request_json, response_json) VALUES (?, ?, ?, ?)';
        const statusCode = decisionStatus === 'auto_created' ? 201 : 500;
        await pool.execute(apiLogSql, [
            internalTicketId,
            statusCode,
            JSON.stringify(mapToExternalPayload(data)),
            JSON.stringify({ simulated_response: "ok", ticket_id: externalTicketId })
        ]);
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