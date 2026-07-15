<<<<<<< HEAD
# M-IA — Frontend

Frontend React + Vite du projet M-IA (assistant IA interne + gouvernance tokens),
conforme à l'arborescence décrite dans le business plan (section 10.2) :

```
src/
  pages/Login      Connexion (SSO + compte de secours local)
  pages/Chat       Assistant IA interne
  pages/Dashboard  Tableau de bord DSI
  pages/Tickets    Tickets M-support qualifiés par l'IA
  pages/Admin      Fournisseurs IA, quotas, rôles & SSO, boîte M-support
  components/      Shell (navigation), QuotaGauge, StatusBadge, ProtectedRoute
  services/api/    Façade API (mockée pour l'instant, prête pour le vrai backend)
  hooks/           useAuth (contexte d'authentification)
```

## Démarrage

```bash
npm install
npm run dev
```

Le site est alors disponible sur http://localhost:5173 (identifiants factices : cliquez
simplement sur "Continuer avec le SSO entreprise" pour entrer).

## État actuel : données simulées

Toutes les données (tickets, quotas, fournisseurs IA, rôles...) sont pour l'instant
générées dans `src/services/api/mockData.js` et servies par `src/services/api/client.js`
avec un délai simulé, pour se comporter comme de vrais appels réseau.

## Brancher le vrai backend

Quand le backend Node.js/Express (section 6 et 12 du business plan) sera disponible :

1. Dans `vite.config.js`, le proxy `/api` pointe déjà vers `http://localhost:4000`
   (à ajuster selon l'environnement).
2. Dans `src/services/api/client.js`, remplacer le corps de chaque fonction par un
   `fetch("/api/...")` vers l'endpoint correspondant (les endpoints cibles sont indiqués
   en commentaire au-dessus de chaque fonction).
3. Dans `src/hooks/useAuth.js`, remplacer `loginSso()` et `loginLocal()` par de vrais
   appels vers `/api/auth/sso/callback` et `/api/auth/login`.

Aucun autre fichier n'a besoin de changer : les pages consomment uniquement les
fonctions exportées par `services/api/client.js`.
=======
# M-IA - Plateforme de Support et d'Audit

## À propos
M-IA est une plateforme de support et d'audit développée pour M-AUTOMOTIV, visant à automatiser la gestion des tickets M-support via l'analyse intelligente des e-mails entrants et un assistant conversationnel interne. La plateforme centralise l'orchestration logicielle, l'authentification SSO et la gouvernance des accès aux modèles d'IA via un LLM Gateway sécurisé. Elle intègre une modélisation SQL Server rigoureuse pour la gestion des rôles, des tokens et de la traçabilité, répondant aux exigences de cybersécurité du système d'information.

## Fonctionnalités
* **Authentification & Rôles :** Accès sécurisé et gestion dynamique des permissions avec mappage direct sur les groupes SSO de l'entreprise (Admin, DSI/RSSI, Agents de support).
* **Token Guard (FinOps IA) :** Contrôle des quotas, vérification des budgets et système de restriction/blocage automatique avant chaque transaction pour maîtriser les coûts.
* **Orchestration & LLM Gateway :** Centralisation du routage multi-modèles et sécurisation des accès aux modèles d'IA exclusivement côté serveur.
* **Automatisation M-support :** Analyse de la boîte mail officielle, système anti-doublon (via Message-ID et empreinte de contenu) et génération automatique de tickets via l'API M-support.
* **Traçabilité & Audit :** Implémentation d'un système de logs rigoureux pour suivre la consommation des tokens, les historiques de tickets et les requêtes, garantissant la conformité et la sécurité des données.

## Technologies & Architecture
* **Backend :** Node.js, Express.js
* **Base de données :** Microsoft SQL Server (T-SQL), module mssql
* **Architecture :** API interne, logique métier centralisée, intégration d'API tierces, modèle de données relationnel sécurisé avec intégrité référentielle
* **Outils :** Visual Studio Code, Git, SQL Server Management Studio (SSMS)

## Auteurs
Projet réalisé par Hiba Karam en collaboration avec Chaimaa Amdaai, Anas Idrissi et Rizki Bekhich - Stagiaires @ M&#8209;AUTOMOTIV.
>>>>>>> 9a844cb85110a7c3000cd4e23c2a82bbf1880243
