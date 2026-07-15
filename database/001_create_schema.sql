CREATE TABLE roles (
    id INT IDENTITY PRIMARY KEY,
    name NVARCHAR(50) NOT NULL UNIQUE,
    permissions NVARCHAR(MAX)
);

CREATE TABLE users (
    id INT IDENTITY PRIMARY KEY,
    role_id INT FOREIGN KEY REFERENCES roles(id),
    email NVARCHAR(255) NOT NULL UNIQUE,
    name NVARCHAR(255) NOT NULL,
    password_hash NVARCHAR(255),
    is_active BIT DEFAULT 1,
    auth_source NVARCHAR(30) NOT NULL DEFAULT 'local', 
    mfa_verified BIT NOT NULL DEFAULT 0,               
);

CREATE TABLE sso_group_mappings (
    id INT IDENTITY PRIMARY KEY,
    group_name NVARCHAR(255) NOT NULL,
    role_id INT FOREIGN KEY REFERENCES roles(id),
    sso_provider NVARCHAR(30) NOT NULL DEFAULT 'oidc', 
);

CREATE TABLE email_messages (
    id BIGINT IDENTITY PRIMARY KEY,
    message_id NVARCHAR(255) NOT NULL UNIQUE,
    from_email NVARCHAR(255) NOT NULL,
    subject NVARCHAR(500) NULL,
    body_hash VARBINARY(32) NOT NULL,
    status NVARCHAR(40) NOT NULL DEFAULT 'new',
    received_at DATETIME2 NOT NULL,
    processed_at DATETIME2 NULL,
    connector_type NVARCHAR(20) NOT NULL DEFAULT 'graph', 
    mailbox NVARCHAR(255) NOT NULL DEFAULT 'support@m-automotiv.com',
);

CREATE TABLE token_usage_logs (
    id BIGINT IDENTITY PRIMARY KEY,
    user_id INT NULL FOREIGN KEY REFERENCES users(id),
    service_name NVARCHAR(120) NULL,
    provider_name NVARCHAR(80) NOT NULL,
    model_name NVARCHAR(120) NOT NULL,
    use_case NVARCHAR(80) NOT NULL,
    input_tokens INT NOT NULL DEFAULT 0,
    output_tokens INT NOT NULL DEFAULT 0,
    estimated_cost DECIMAL(18,6) NOT NULL DEFAULT 0,
    status NVARCHAR(30) NOT NULL,
    correlation_id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE tickets (
    id BIGINT IDENTITY PRIMARY KEY,
    email_message_id BIGINT FOREIGN KEY REFERENCES email_messages(id),
    title NVARCHAR(500) NOT NULL,
    status NVARCHAR(50) NOT NULL,
    msupport_ticket_id NVARCHAR(100) NULL
);

CREATE TABLE msupport_api_logs (
    id BIGINT IDENTITY PRIMARY KEY,
    ticket_id BIGINT NULL FOREIGN KEY REFERENCES tickets(id),
    status_code INT NOT NULL,
    request_json NVARCHAR(MAX) NOT NULL,
    response_json NVARCHAR(MAX) NULL
);

CREATE TABLE chat_sessions (
    id BIGINT IDENTITY PRIMARY KEY,
    user_id INT NOT NULL FOREIGN KEY REFERENCES users(id),
    title NVARCHAR(255) NULL,
    is_active BIT DEFAULT 1,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE chat_messages (
    id BIGINT IDENTITY PRIMARY KEY,
    session_id BIGINT NOT NULL FOREIGN KEY REFERENCES chat_sessions(id),
    role NVARCHAR(50) NOT NULL,
    content NVARCHAR(MAX) NOT NULL,
    model_used NVARCHAR(120) NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE sessions (
    id BIGINT IDENTITY PRIMARY KEY,
    user_id INT NOT NULL FOREIGN KEY REFERENCES users(id),
    refresh_token NVARCHAR(500) NOT NULL,
    refresh_token_hash NVARCHAR(128) NULL, 
    ip_address NVARCHAR(45) NULL,
    user_agent NVARCHAR(500) NULL,
    expires_at DATETIME2 NOT NULL,
    revoked BIT DEFAULT 0,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE email_attachments (
    id BIGINT IDENTITY PRIMARY KEY,
    email_message_id BIGINT NOT NULL FOREIGN KEY REFERENCES email_messages(id),
    file_name NVARCHAR(255) NOT NULL,
    content_type NVARCHAR(100) NOT NULL,
    file_size INT NOT NULL,
    stored_path NVARCHAR(500) NULL
);

CREATE TABLE ai_providers (
    id INT IDENTITY PRIMARY KEY,
    name NVARCHAR(80) NOT NULL UNIQUE,
    is_active BIT DEFAULT 1,
    api_url NVARCHAR(255) NULL
);

CREATE TABLE ai_analysis (
    id BIGINT IDENTITY PRIMARY KEY,
    email_message_id BIGINT NULL FOREIGN KEY REFERENCES email_messages(id),
    provider_id INT FOREIGN KEY REFERENCES ai_providers(id),
    confidence_score DECIMAL(3,2) NULL,
    extracted_json NVARCHAR(MAX) NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE ticket_history (
    id BIGINT IDENTITY PRIMARY KEY,
    ticket_id BIGINT NOT NULL FOREIGN KEY REFERENCES tickets(id),
    old_status NVARCHAR(50) NULL,
    new_status NVARCHAR(50) NOT NULL,
    changed_by INT NULL FOREIGN KEY REFERENCES users(id),
    changed_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE token_policies (
    id INT IDENTITY PRIMARY KEY,
    role_id INT NULL FOREIGN KEY REFERENCES roles(id),
    service_name NVARCHAR(120) NULL,
    daily_token_limit INT NULL,
    monthly_budget DECIMAL(18,2) NULL
);

CREATE TABLE cost_alerts (
    id BIGINT IDENTITY PRIMARY KEY,
    user_id INT NULL FOREIGN KEY REFERENCES users(id),
    service_name NVARCHAR(120) NULL,
    alert_level INT NOT NULL, 
    message NVARCHAR(500) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE audit_logs (
    id BIGINT IDENTITY PRIMARY KEY,
    user_id INT NULL FOREIGN KEY REFERENCES users(id),
    action NVARCHAR(255) NOT NULL,
    details NVARCHAR(MAX) NULL,
    ip_address NVARCHAR(45) NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE settings (
    id INT IDENTITY PRIMARY KEY,
    setting_key NVARCHAR(100) NOT NULL UNIQUE,
    setting_value NVARCHAR(MAX) NOT NULL,
    is_secret BIT DEFAULT 0
);