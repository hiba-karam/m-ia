const { sql } = require('../../config/db');

const getProviders = async (req, res) => {
    try {
        const request = new sql.Request();
        const result = await request.query(`SELECT * FROM ai_providers`);
        res.status(200).json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur." });
    }
};

const getQuotas = async (req, res) => {
    try {
        const request = new sql.Request();
        const result = await request.query(`SELECT * FROM token_policies`);
        res.status(200).json(result.recordset);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur." });
    }
};

const getRoles = async (req, res) => {
    try {
        const request = new sql.Request();
        const rolesResult = await request.query(`SELECT id, name, permissions, description FROM roles ORDER BY name`);
        
        const mappingsResult = await request.query(`SELECT * FROM sso_group_mappings ORDER BY sso_provider, group_name`);
        
        res.status(200).json({
            roles: rolesResult.recordset,
            ssoMappings: mappingsResult.recordset,
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur." });
    }
};

const getMailboxSettings = async (req, res) => {
    try {
        const request = new sql.Request();
        const result = await request.query(`
            SELECT TOP 1 
                connector_type as connector,
                host,
                port,
                use_ssl as secure,
                username,
                mailbox,
                sync_max_emails as maxEmails,
                allowed_domains,
                attachment_max_bytes as maxAttachmentSize,
                allowed_extensions
            FROM email_config
            ORDER BY id DESC
        `);
        
        if (result.recordset.length === 0) {
            return res.status(200).json({
                connector: process.env.EMAIL_CONNECTOR || 'graph',
                host: process.env.IMAP_HOST || '',
                port: parseInt(process.env.IMAP_PORT || '993'),
                secure: process.env.IMAP_SECURE !== 'false',
                username: process.env.IMAP_USER || '',
                mailbox: process.env.IMAP_MAILBOX || 'INBOX',
                maxEmails: parseInt(process.env.EMAIL_SYNC_MAX || '50'),
                allowedDomains: process.env.EMAIL_ALLOWED_DOMAINS || '',
                maxAttachmentSize: parseInt(process.env.EMAIL_ATTACHMENT_MAX_BYTES || '10485760'),
                allowedExtensions: process.env.EMAIL_ALLOWED_EXTENSIONS || '',
            });
        }
        
        res.status(200).json(result.recordset[0]);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur." });
    }
};

module.exports = { getProviders, getQuotas, getRoles, getMailboxSettings };