module.exports = {
    // graph | imap — une seule boîte officielle M-support
    connector: (process.env.EMAIL_CONNECTOR || 'graph').toLowerCase(),
    mailbox: process.env.MSUPPORT_MAILBOX,

    graph: {
        tenantId: process.env.AZURE_TENANT_ID,
        clientId: process.env.AZURE_CLIENT_ID,
        clientSecret: process.env.AZURE_CLIENT_SECRET,
        userId: process.env.MSUPPORT_GRAPH_USER_ID, // ID ou UPN de la boîte M-support
    },

    imap: {
        host: process.env.IMAP_HOST,
        port: parseInt(process.env.IMAP_PORT || '993', 10),
        secure: process.env.IMAP_SECURE !== 'false',
        user: process.env.IMAP_USER,
        password: process.env.IMAP_PASSWORD,
        mailbox: process.env.IMAP_MAILBOX || 'INBOX',
    },

    sync: {
        maxMessagesPerRun: parseInt(process.env.EMAIL_SYNC_MAX || '50', 10),
        allowedDomains: (process.env.EMAIL_ALLOWED_DOMAINS || '')
            .split(',')
            .map((d) => d.trim())
            .filter(Boolean),
        attachmentMaxBytes: parseInt(process.env.EMAIL_ATTACHMENT_MAX_BYTES || String(10 * 1024 * 1024), 10),
        allowedExtensions: (process.env.EMAIL_ALLOWED_EXTENSIONS || '.pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt')
            .split(',')
            .map((e) => e.trim().toLowerCase()),
    },
};
