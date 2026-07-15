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
    is_active BIT DEFAULT 1
);

CREATE TABLE sso_group_mappings (
    id INT IDENTITY PRIMARY KEY,
    group_name NVARCHAR(255) NOT NULL,
    role_id INT FOREIGN KEY REFERENCES roles(id)
);

CREATE TABLE email_messages (
    id BIGINT IDENTITY PRIMARY KEY,
    message_id NVARCHAR(255) NOT NULL UNIQUE,
    from_email NVARCHAR(255) NOT NULL,
    subject NVARCHAR(500) NULL,
    body_hash VARBINARY(32) NOT NULL,
    status NVARCHAR(40) NOT NULL DEFAULT 'new',
    received_at DATETIME2 NOT NULL,
    processed_at DATETIME2 NULL
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