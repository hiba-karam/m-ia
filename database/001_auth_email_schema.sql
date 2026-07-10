-- M-IA : schéma SSO (auth) + Email Connector (boîte M-support uniquement)
-- Périmètre : tables nécessaires aux tâches SSO et Email

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'roles')
CREATE TABLE roles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(50) NOT NULL UNIQUE,
    permissions NVARCHAR(MAX) NOT NULL DEFAULT '[]',
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    email NVARCHAR(255) NOT NULL UNIQUE,
    display_name NVARCHAR(255) NULL,
    password_hash NVARCHAR(255) NULL,
    role_id INT NOT NULL REFERENCES roles(id),
    auth_source NVARCHAR(30) NOT NULL DEFAULT 'local', -- local, oidc, saml, ldap
    is_active BIT NOT NULL DEFAULT 1,
    mfa_verified BIT NOT NULL DEFAULT 0,
    last_login_at DATETIME2 NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'sso_group_mappings')
CREATE TABLE sso_group_mappings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    sso_provider NVARCHAR(30) NOT NULL, -- oidc, saml, ldap
    group_name NVARCHAR(255) NOT NULL,
    role_id INT NOT NULL REFERENCES roles(id),
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT uq_sso_group UNIQUE (sso_provider, group_name)
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'sessions')
CREATE TABLE sessions (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    refresh_token_hash NVARCHAR(128) NOT NULL,
    ip_address NVARCHAR(45) NULL,
    user_agent NVARCHAR(500) NULL,
    expires_at DATETIME2 NOT NULL,
    revoked_at DATETIME2 NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'email_messages')
CREATE TABLE email_messages (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    message_id NVARCHAR(255) NOT NULL UNIQUE,
    from_email NVARCHAR(255) NOT NULL,
    from_name NVARCHAR(255) NULL,
    subject NVARCHAR(500) NULL,
    body_preview NVARCHAR(1000) NULL,
    body_hash VARBINARY(32) NOT NULL,
    status NVARCHAR(40) NOT NULL DEFAULT 'new', -- new, processed, duplicate, rejected, error
    connector_type NVARCHAR(20) NOT NULL, -- graph, imap
    mailbox NVARCHAR(255) NOT NULL,
    received_at DATETIME2 NOT NULL,
    processed_at DATETIME2 NULL,
    correlation_id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'email_attachments')
CREATE TABLE email_attachments (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    email_message_id BIGINT NOT NULL REFERENCES email_messages(id),
    file_name NVARCHAR(255) NOT NULL,
    content_type NVARCHAR(120) NULL,
    size_bytes BIGINT NOT NULL DEFAULT 0,
    storage_path NVARCHAR(500) NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE INDEX idx_email_messages_status ON email_messages(status);
CREATE INDEX idx_email_messages_received ON email_messages(received_at DESC);
CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sso_group_mappings_provider ON sso_group_mappings(sso_provider, group_name);
