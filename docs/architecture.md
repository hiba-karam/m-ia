# Architecture Technique - M-IA Backend

## Vue d'ensemble
L'application repose sur une architecture modulaire développée sous Node.js et Express.js. Le système est conçu pour isoler les domaines fonctionnels, garantissant une maintenance aisée et une scalabilité horizontale.

## Composants Systèmes
- Core: Serveur Express.js avec gestion des routes et middlewares centraux.
- Persistance: Microsoft SQL Server (T-SQL) pour la gestion des données relationnelles.
- Sécurité: Authentification basée sur JWT et middleware de contrôle d'accès.

## Structure des Répertoires
- /src/config: Gestion des connexions à la base de données.
- /src/middlewares: Couche de filtrage (Auth, Token Guard, Audit).
- /src/modules: Logique métier isolée par module (Routes et Controllers associés).

## Modèle de Données
Le schéma SQL garantit l'intégrité référentielle pour les entités suivantes:
- Gestion des accès: users, roles, sessions.
- Gouvernance IA: token_usage_logs (finOps), audit_logs.
- Opérationnel: tickets, email_messages.