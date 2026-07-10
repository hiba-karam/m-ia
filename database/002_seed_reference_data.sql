INSERT INTO roles (name, permissions) VALUES 
('Admin M-IA', '{"all": true}'),
('DSI/RSSI', '{"audit_read": true, "dashboard": true, "budgets": true}'),
('Superviseur support', '{"tickets_manage": true, "reports": true}'),
('Agent support', '{"tickets_edit": true, "chat": true}'),
('Utilisateur', '{"chat": true, "files": true}'),
('Lecteur audit', '{"audit_read": true}');

INSERT INTO sso_group_mappings (group_name, role_id) VALUES 
('GRP_MIA_ADMINS', 1),
('GRP_MIA_DSI', 2),
('GRP_MIA_SUP_MANAGER', 3),
('GRP_MIA_SUP_AGENT', 4),
('GRP_ALL_EMPLOYEES', 5),
('GRP_MIA_AUDIT', 6);

INSERT INTO users (role_id, email, name, password_hash, is_active) VALUES 
(1, 'admin@m-automotiv.com', 'Admin Secours', '$2b$10$DoFXvS96s7PaYBIQrvvUfurV6R8UEFDBmmtiuoKRL5QgNyNkiaXM2', 1);