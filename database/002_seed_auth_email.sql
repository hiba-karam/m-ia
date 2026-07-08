-- Données de référence : rôles RBAC + mappings groupes SSO (exemples)

IF NOT EXISTS (SELECT 1 FROM roles WHERE name = 'Admin')
INSERT INTO roles (name, permissions) VALUES
('Admin', '["*"]'),
('DSI_RSSI', '["audit:read","dashboard:read","tokens:read","users:read"]'),
('Superviseur', '["tickets:read","tickets:qualify","dashboard:support"]'),
('AgentSupport', '["tickets:read","tickets:write","chat:read","chat:write"]'),
('Utilisateur', '["chat:read","chat:write"]'),
('LecteurAudit', '["audit:read"]');

-- Mappings groupes Entra ID / AD -> rôles M-IA (à adapter selon l'entreprise)
IF NOT EXISTS (SELECT 1 FROM sso_group_mappings WHERE group_name = 'M-IA-Admins')
INSERT INTO sso_group_mappings (sso_provider, group_name, role_id)
SELECT 'oidc', 'M-IA-Admins', id FROM roles WHERE name = 'Admin'
UNION ALL
SELECT 'oidc', 'M-IA-DSI', id FROM roles WHERE name = 'DSI_RSSI'
UNION ALL
SELECT 'oidc', 'M-IA-Support', id FROM roles WHERE name = 'AgentSupport'
UNION ALL
SELECT 'oidc', 'M-IA-Users', id FROM roles WHERE name = 'Utilisateur'
UNION ALL
SELECT 'ldap', 'CN=M-IA-Admins,OU=Groups,DC=entreprise,DC=local', id FROM roles WHERE name = 'Admin'
UNION ALL
SELECT 'ldap', 'CN=M-IA-Support,OU=Groups,DC=entreprise,DC=local', id FROM roles WHERE name = 'AgentSupport';

-- Compte admin local de secours : créer via scripts/create-admin.js
-- Exemple : ADMIN_EMAIL=admin@m-ia.local ADMIN_PASSWORD=*** node scripts/create-admin.js
