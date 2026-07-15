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
