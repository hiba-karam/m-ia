# Documentation Technique Complète : Projet M-IA

## 1. Vision et Objectifs Stratégiques
M-IA est une plateforme d'intelligence artificielle interne, gouvernée, sécurisée et optimisée pour l'entreprise. Elle vise deux objectifs principaux :
- **Assistant IA interne :** Un portail de chat sécurisé supportant ChatGPT, Claude, Gemini, DeepSeek et Kimi. Il remplace les usages risqués des IA publiques.
- **Automatisation M-Support :** Un moteur de qualification automatique qui analyse la boîte mail officielle de M-support pour créer ou qualifier des tickets, garantissant traçabilité et efficacité opérationnelle.

## 2. Architecture Technique
Le système adopte une architecture modulaire pour garantir maintenabilité et parallélisation :
- **Frontend :** Application web développée en **React + Vite**. Interface utilisateur centrée sur le chat, le dashboard de monitoring et l'administration.
- **Backend :** API REST développée en **Node.js + Express**. Orchestration des services, sécurité, routage IA et logique métier.
- **Base de données :** **SQL Server**. Stockage structuré des utilisateurs, rôles, logs, tokens, politiques de quotas et historique des tickets/conversations.

## 3. Gouvernance, Sécurité et FinOps IA
La plateforme est régie par des règles strictes de sécurité et de maîtrise budgétaire (FinOps) :
- **LLM Gateway :** Couche d'abstraction obligatoire. Centralise les appels, normalise les prompts, assure le routage intelligent (selon coût/besoin) et journalise les activités.
- **Token Guard :** Système de "pré-check" obligatoire avant chaque appel IA. 
    - *Fonctionnement :* Estime les tokens (input/output) et le coût. Vérifie le budget disponible.
    - *Seuils :* 70% (Alerte DSI), 90% (Restriction modèles Premium), 100% (Blocage total).
- **Sécurité RSSI :** Gestion centralisée des secrets dans le backend (variables d'environnement `.env`), jamais exposés en frontend. Authentification robuste via SSO (OIDC/SAML), MFA et gestion fine des accès (RBAC).

## 4. Workflow d'Automatisation (Email vers Ticket)
1. **Récupération :** Lecture dédiée de la boîte mail officielle M-support.
2. **Idempotence :** Vérification de l'unicité via le `Message-ID` et hash du contenu pour éviter tout ticket en double.
3. **Analyse IA :** Normalisation en JSON structuré par la LLM Gateway (résumé, catégorie, priorité, score de confiance, etc.).
4. **Décision Métier :**
    - Score ≥ 0,85 : Création automatique dans M-support via API.
    - Score 0,60 - 0,84 : Ticket mis en statut "à qualifier" pour vérification humaine.
    - Score < 0,60 : Demande de complément ou traitement manuel.
5. **Feedback :** Accusé de réception envoyé au demandeur incluant le numéro officiel du ticket.

## 5. Répartition des Responsabilités (Team Work)
- **Hiba (Backend & Base de données) :** Socle Node.js/Express, développement des API, modélisation SQL Server (schémas, audit, logs, tickets, politiques de quotas).
- **Rizqi (Frontend) :** Interface React/Vite (Dashboard utilisateur, espace chat), visualisation des KPI de consommation (dashboards de coûts) et écrans d'administration.
- **Anass (SSO & Email Connector) :** Sécurisation des accès (SSO, MFA, RBAC) et développement du connecteur mail (lecture boîte M-support, gestion Message-ID).
- **Chaimaa (LLM Gateway & API M-support) :** Cœur de la gouvernance IA (routage, normalisation de prompts) et intégration critique avec l'API M-support.

## 6. Contrats d'Interface et API JSON
Le JSON est le langage commun entre les modules. 
- **Vérification de quota (`POST /api/token/check`) :** Doit être appelé avant chaque requête IA.
- **Création de ticket (`POST /api/msupport/tickets`) :** Contient l'objet `ai` avec le `confidence score` et le `modelUsed`.

## 7. Points de Vigilance Critiques
- **Sécurité :** Ne jamais stocker de clés API en frontend.
- **Intégrité budgétaire :** Toujours rapporter la consommation réelle de tokens au Token Guard après un appel.
- **Idempotence :** L'usage du `Message-ID` est impératif.
- **Isolation :** Utiliser des *mocks* lors des phases de développement pour tester les interfaces sans dépendre de l'API réelle ou des autres modules.