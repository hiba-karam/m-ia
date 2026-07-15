const crypto = require('crypto');
const { query } = require('../../config/db');
const { hashBody } = require('../auth/authService');

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
         (message_id, from_email, subject, body_hash,
          status, connector_type, mailbox, received_at)
         OUTPUT INSERTED.id
         VALUES (@messageId, @fromEmail, @subject, @bodyHash,
                 'new', @connectorType, @mailbox, @receivedAt)`,
        {
            messageId: message.messageId,
            fromEmail: message.fromEmail,
            subject: (message.subject || '').slice(0, 500),
            bodyHash,
            connectorType,
            mailbox,
            receivedAt: message.receivedAt
        }
    );

    const emailId = insertResult.recordset[0].id;

    if (message.attachments?.length) {
        for (const attachment of message.attachments) {
            await query(
                `INSERT INTO email_attachments (email_message_id, file_name, content_type, file_size)
                 VALUES (@emailId, @fileName, @contentType, @fileSize)`,
                {
                    emailId,
                    fileName: attachment.fileName,
                    contentType: attachment.contentType || null,
                    fileSize: attachment.sizeBytes || 0,
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
