INSERT INTO roles (name, permissions) VALUES 
('Admin M-IA', '{"all": true}'),
('DSI/RSSI', '{"audit_read": true, "dashboard": true, "budgets": true}'),
('Superviseur support', '{"tickets_manage": true, "reports": true}'),
('Agent support', '{"tickets_edit": true, "chat": true}'),
('Utilisateur', '{"chat": true, "files": true}'),
('Lecteur audit', '{"audit_read": true}');

INSERT INTO sso_group_mappings (sso_provider, group_name, role_id) VALUES 
('oidc', 'GRP_MIA_ADMINS', 1),
('oidc', 'GRP_MIA_DSI', 2),
('oidc', 'GRP_MIA_SUP_MANAGER', 3),
('oidc', 'GRP_MIA_SUP_AGENT', 4),
('oidc', 'GRP_ALL_EMPLOYEES', 5),
('oidc', 'GRP_MIA_AUDIT', 6);