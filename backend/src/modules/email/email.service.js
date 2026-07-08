const emailConfig = require('../../config/email.config');
const graphConnector = require('./connectors/graph.connector');
const imapConnector = require('./connectors/imap.connector');
const { saveEmail } = require('./dedup.service');
const { query } = require('../../config/db');

function getConnector() {
    if (emailConfig.connector === 'imap') return imapConnector;
    return graphConnector;
}

function validateMailboxConfig() {
    if (!emailConfig.mailbox && !emailConfig.graph.userId && emailConfig.connector === 'graph') {
        throw new Error('Boîte M-support non configurée (MSUPPORT_MAILBOX).');
    }
}

function isAllowedSender(fromEmail) {
    if (!fromEmail) return false;
    const domains = emailConfig.sync.allowedDomains;
    if (!domains.length) return true;
    const domain = fromEmail.split('@')[1]?.toLowerCase();
    return domains.some((d) => domain === d.toLowerCase());
}

function filterAttachments(attachments = []) {
    const maxSize = emailConfig.sync.attachmentMaxBytes;
    const allowedExt = emailConfig.sync.allowedExtensions;

    return attachments.filter((att) => {
        if (att.sizeBytes > maxSize) return false;
        const ext = (att.fileName || '').slice(att.fileName.lastIndexOf('.')).toLowerCase();
        return allowedExt.includes(ext);
    });
}

async function syncMailbox() {
    validateMailboxConfig();
    const connector = getConnector();
    const connectorType = emailConfig.connector;
    const mailbox = emailConfig.mailbox || emailConfig.imap.mailbox || emailConfig.graph.userId;

    const fetched = await connector.fetchUnreadMessages();
    const results = {
        connector: connectorType,
        mailbox,
        fetched: fetched.length,
        saved: 0,
        duplicates: 0,
        rejected: 0,
        errors: 0,
        items: [],
    };

    for (const message of fetched) {
        try {
            if (!isAllowedSender(message.fromEmail)) {
                results.rejected += 1;
                results.items.push({ messageId: message.messageId, status: 'rejected', reason: 'domain_not_allowed' });
                continue;
            }

            message.attachments = filterAttachments(message.attachments);

            const saved = await saveEmail(message, connectorType, mailbox);

            if (saved.status === 'duplicate') {
                results.duplicates += 1;
            } else {
                results.saved += 1;
                if (message.graphId) await connector.markAsProcessed(message.graphId);
                if (message.imapUid) await connector.markAsProcessed(message.imapUid);
            }

            results.items.push(saved);
        } catch (error) {
            results.errors += 1;
            results.items.push({ messageId: message.messageId, status: 'error', error: error.message });
        }
    }

    return results;
}

async function listEmails({ status, limit = 50 } = {}) {
    const params = { limit };
    let where = '';
    if (status) {
        where = 'WHERE status = @status';
        params.status = status;
    }

    const result = await query(
        `SELECT TOP (@limit) id, message_id, from_email, from_name, subject, status,
                connector_type, mailbox, received_at, correlation_id
         FROM email_messages
         ${where}
         ORDER BY received_at DESC`,
        params
    );

    return result.recordset;
}

async function getEmailById(id) {
    const result = await query(
        `SELECT e.*, (
            SELECT file_name, content_type, size_bytes
            FROM email_attachments a WHERE a.email_message_id = e.id
            FOR JSON PATH
         ) AS attachments
         FROM email_messages e WHERE e.id = @id`,
        { id }
    );
    return result.recordset[0] || null;
}

module.exports = { syncMailbox, listEmails, getEmailById };
