const { ImapFlow } = require('imapflow');
const { simpleParser } = require('mailparser');
const emailConfig = require('../../../config/email.config');

async function fetchUnreadMessages() {
    const { host, port, secure, user, password, mailbox } = emailConfig.imap;
    if (!host || !user || !password) {
        throw new Error('Configuration IMAP incomplète (IMAP_HOST, IMAP_USER, IMAP_PASSWORD).');
    }

    const client = new ImapFlow({
        host,
        port,
        secure,
        auth: { user, pass: password },
        logger: false,
    });

    const messages = [];

    try {
        await client.connect();
        const lock = await client.getMailboxLock(mailbox);
        try {
            const max = emailConfig.sync.maxMessagesPerRun;
            const unseen = await client.search({ seen: false }, { uid: true });
            const uids = unseen.slice(0, max);

            for (const uid of uids) {
                const msg = await client.fetchOne(uid, { source: true, envelope: true, uid: true }, { uid: true });
                const parsed = await simpleParser(msg.source);

                const attachments = (parsed.attachments || []).map((att) => ({
                    fileName: att.filename || 'attachment',
                    contentType: att.contentType,
                    sizeBytes: att.size || 0,
                }));

                messages.push({
                    messageId: parsed.messageId || `imap-${uid}`,
                    fromEmail: parsed.from?.value?.[0]?.address,
                    fromName: parsed.from?.value?.[0]?.name,
                    subject: parsed.subject,
                    bodyPreview: (parsed.text || parsed.html || '').slice(0, 1000),
                    bodyText: parsed.text || '',
                    receivedAt: parsed.date || new Date(),
                    attachments,
                    imapUid: uid,
                });
            }
        } finally {
            lock.release();
        }
    } finally {
        await client.logout();
    }

    return messages;
}

async function markAsProcessed(imapUid) {
    const { host, port, secure, user, password, mailbox } = emailConfig.imap;
    const client = new ImapFlow({ host, port, secure, auth: { user, pass: password }, logger: false });

    try {
        await client.connect();
        const lock = await client.getMailboxLock(mailbox);
        try {
            await client.messageFlagsAdd({ uid: imapUid }, ['\\Seen'], { uid: true });
        } finally {
            lock.release();
        }
    } finally {
        await client.logout();
    }
}

module.exports = { fetchUnreadMessages, markAsProcessed };
