# Documentation API REST

## Authentification
Toute requête vers une route protégée doit inclure le header: Authorization: Bearer <token>.

## Endpoints Principaux

### POST /api/auth/login
Authentification utilisateur.
- Body: { "email": "string", "password": "string" }

### GET /api/audit
Extraction des logs d'audit système.

### POST /api/tickets/draft
Création d'un brouillon de ticket.
- Body: { "title": "string" }

### GET /api/admin/providers
Récupération des fournisseurs IA enregistrés.

### POST /api/token/check
Validation des quotas avant exécution d'une requête LLM.
- Body: { "userId": int, "service": "string", "useCase": "string", "provider": "string", "estimatedInputTokens": int, "estimatedOutputTokens": int }