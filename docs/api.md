# Documentation API REST

## Authentification
Toute requête vers une route protégée doit inclure un jeton d'accès (token).
*Dans des outils comme Thunder Client ou Postman, il est recommandé d'aller dans l'onglet **Auth**, de choisir le type **Bearer Token** et d'y coller le token, plutôt que de l'écrire manuellement dans les Headers.*

## Endpoints Principaux

### 1. Authentification & SSO (Module Auth)

#### GET /api/auth/providers
Récupération des modes d'authentification disponibles configurés (OIDC, SAML, LDAP, Local).

#### POST /api/auth/login
Authentification utilisateur (Local de secours ou Active Directory/LDAP).
- Body: { "email": "string", "password": "string", "mode": "local|ldap" }

#### GET /api/auth/sso/login
Génère une URL de redirection vers le fournisseur d'identité (IdP).
- Query: ?mode=oidc ou ?mode=saml

#### GET /api/auth/sso/callback
#### POST /api/auth/saml/callback
Endpoints de retour pour le fournisseur d'identité. Échange le code contre les tokens JWT et mappe les rôles.

#### GET /api/auth/me
Récupération du profil de l'utilisateur connecté et de ses permissions (RBAC).

### 2. Connecteur Email (Module M-support)

#### POST /api/msupport/emails/sync
Synchronisation manuelle de la boîte mail officielle M-support (Graph API ou IMAP). 
- *Nécessite la permission 	ickets:write ou Admin.*

#### GET /api/msupport/emails
Lister les e-mails importés et traités par l'orchestrateur.

#### GET /api/msupport/emails/:id
Récupération des détails d'un e-mail spécifique (incluant les métadonnées des pièces jointes).

### 3. Orchestration & LLM Gateway (Module IA)

#### POST /api/llm/chat
Appel à la passerelle multi-modèles (OpenAI, Claude, Gemini, DeepSeek, Kimi) avec routage automatique basé sur le cas d'usage et gestion du fallback de secours.
- Body: { "prompt": "string", "useCase": "auto|analyse_technique|...", "sessionId": int }

#### POST /api/token/check
Validation des quotas Token Guard avant l'exécution d'une requête LLM.
- Body: { "userId": int, "useCase": "string", "provider": "string", "estimatedInputTokens": int, "estimatedOutputTokens": int }

### 4. Automatisation M-support (Module Tickets)

#### POST /api/msupport/webhook
Création automatique d'un ticket M-support dans le système externe si la confiance de l'IA est supérieure à 85%.

#### POST /api/tickets/draft
Création d'un brouillon de ticket manuel ou semi-automatique.
- Body: { "title": "string", "description": "string" }

### 5. Traçabilité & Gouvernance

#### GET /api/audit
Extraction des logs d'audit système (audit des accès, requêtes API et traçabilité des tickets).

#### GET /api/admin/providers
Récupération des fournisseurs IA enregistrés dans la table i_providers.
