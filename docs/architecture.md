# Architecture Technique - M-IA Backend

## Vue d'ensemble
L'application repose sur une architecture modulaire développée sous Node.js et Express.js. Le système est conçu pour isoler les domaines fonctionnels, garantissant une maintenance aisée et une scalabilité horizontale. Le but ultime est de traiter les emails de support, les analyser via IA et les intégrer dans le système M-support.

## Flux d'orchestration global
Le système fonctionne selon un flux automatisé précis :
1. **Email Connector** : Récupère les e-mails non lus de la boîte officielle M-support via Microsoft Graph API ou IMAP sécurisé. Un service anti-doublon (vérifiant le Message-ID et le Hash SHA-256 du contenu) empêche le traitement multiple.
2. **LLM Gateway** : L'e-mail est envoyé à la passerelle IA qui utilise le modèle le plus approprié (ChatGPT, Claude, Gemini, DeepSeek, Kimi) pour analyser la requête et retourner un score de confiance. Si le modèle principal échoue, un *Fallback* vers OpenAI est déclenché.
3. **M-support API** : Si la confiance de l'IA est $\ge 0.85$, l'API externe de M-support est appelée pour créer le ticket automatiquement. Sinon, le ticket est mis en statut 	o_qualify (Manuel).

## Authentification et Sécurité (SSO & RBAC)
La sécurité est gérée au travers de plusieurs fournisseurs d'identité :
- **OpenID Connect (OIDC)** et **SAML** pour l'authentification Entreprise (MFA géré par l'IdP).
- **LDAP/Active Directory** pour les connexions locales (on-premise).
- Un mapping dynamique est effectué pour convertir les Groupes SSO vers des Rôles applicatifs internes (Admin, DSI, Agent, etc.).
- L'API utilise des tokens JWT à courte durée (15min) et un système de Refresh Token persisté en base.

## Composants Systèmes
- **Core**: Serveur Express.js avec gestion des routes et middlewares centraux.
- **Persistance**: Microsoft SQL Server (T-SQL) pour la gestion des données relationnelles.
- **Sécurité**: Authentification basée sur JWT et middleware de contrôle d'accès.

## Structure des Répertoires
- /src/config: Gestion des connexions à la base de données et LLMs.
- /src/middlewares: Couche de filtrage (Auth, Token Guard, Audit).
- /src/modules: Logique métier isolée par module (Routes, Controllers, Services, Adapters).

## Modèle de Données
Le schéma SQL garantit l'intégrité référentielle pour les entités suivantes:
- **Gestion des accès**: users, oles, sso_group_mappings, sessions.
- **Gouvernance IA**: 	oken_usage_logs (finOps), udit_logs, msupport_api_logs.
- **Opérationnel**: 	ickets, email_messages, email_attachments, chat_sessions.
