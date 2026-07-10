const crypto = require('crypto');
const { query } = require('../../config/db');
const { hashBody } = require('../auth/auth.service');

async function isDuplicate(messageId, bodyHash) {
    const byMessageId = await query(
        'SELECT id FROM email_messages WHERE message_id = @messageId',
        { messageId }
    );
    if (byMessageId.recordset.length) {
        return { duplicate: true, reason: 'message_id' };
    }

    const byHash = await query(
        'SELECT id FROM email_messages WHERE body_hash = @bodyHash',
        { bodyHash }
    );
    if (byHash.recordset.length) {
        return { duplicate: true, reason: 'body_hash' };
    }

    return { duplicate: false };
}

async function saveEmail(message, connectorType, mailbox) {
    const bodyHash = hashBody(message.bodyText || message.bodyPreview || '');

    const dup = await isDuplicate(message.messageId, bodyHash);
    if (dup.duplicate) {
        return { status: 'duplicate', reason: dup.reason, messageId: message.messageId };
    }

    const correlationId = crypto.randomUUID();
    const insertResult = await query(
        `INSERT INTO email_messages
         (message_id, from_email, from_name, subject, body_preview, body_hash,
          status, connector_type, mailbox, received_at, correlation_id)
         OUTPUT INSERTED.id
         VALUES (@messageId, @fromEmail, @fromName, @subject, @bodyPreview, @bodyHash,
                 'new', @connectorType, @mailbox, @receivedAt, @correlationId)`,
        {
            messageId: message.messageId,
            fromEmail: message.fromEmail,
            fromName: message.fromName || null,
            subject: (message.subject || '').slice(0, 500),
            bodyPreview: (message.bodyPreview || '').slice(0, 1000),
            bodyHash,
            connectorType,
            mailbox,
            receivedAt: message.receivedAt,
            correlationId,
        }
    );

    const emailId = insertResult.recordset[0].id;

    if (message.attachments?.length) {
        for (const attachment of message.attachments) {
            await query(
                `INSERT INTO email_attachments (email_message_id, file_name, content_type, size_bytes)
                 VALUES (@emailId, @fileName, @contentType, @sizeBytes)`,
                {
                    emailId,
                    fileName: attachment.fileName,
                    contentType: attachment.contentType || null,
                    sizeBytes: attachment.sizeBytes || 0,
                }
            );
        }
    }

    return {
        status: 'new',
        id: emailId,
        messageId: message.messageId,
        correlationId,
    };
}

module.exports = { isDuplicate, saveEmail };
