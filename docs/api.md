# Documentation API REST

## Authentification
Toute requête vers une route protégée doit inclure un jeton d'accès (token).
*Dans des outils comme Thunder Client ou Postman, il est recommandé d'aller dans l'onglet **Auth**, de choisir le type **Bearer Token** et d'y coller le token, plutôt que de l'écrire manuellement dans les Headers.*

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