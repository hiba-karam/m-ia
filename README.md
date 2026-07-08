# M-IA - Plateforme de Support et d'Audit Intelligent

## À propos
Ce projet constitue le socle backend (API) de l'application M-IA, développée pour M-AUTOMOTIV. Il s'agit d'une architecture robuste conçue pour centraliser la gestion des tickets de support, le traitement des e-mails, et l'administration des utilisateurs. Le système intègre une gestion avancée des rôles (RBAC) via des mappages de groupes SSO, ainsi que des mécanismes stricts d'audit et de traçabilité pour répondre aux exigences de cybersécurité du système d'information.

## Fonctionnalités
* **Authentification & Rôles :** Accès sécurisé et gestion dynamique des permissions (format JSON) avec mappage direct sur les groupes SSO de l'entreprise (Admin, DSI/RSSI, Agents de support).
* **Traçabilité & Audit :** Implémentation d'un système de logs rigoureux pour suivre l'utilisation des tokens d'API et les requêtes, garantissant la conformité et la sécurité des données.
* **Gestion des Tickets & E-mails :** Architecture relationnelle permettant de corréler précisément (via des UUID) les requêtes e-mails entrantes aux tickets de support générés.
* **API RESTful :** Architecture centralisée assurant la communication sécurisée et asynchrone entre la base de données et les futures interfaces clientes.

## Technologies & Architecture
* **Backend :** Node.js, Express.js
* **Base de données :** Microsoft SQL Server (T-SQL), module mssql
* **Architecture :** API REST, logique métier centralisée, modèle de données relationnel sécurisé avec intégrité référentielle
* **Outils :** Visual Studio Code, Git, SQL Server Management Studio (SSMS)

## Auteurs
Projet réalisé par Hiba Karam en collaboration avec Chaimaa Amdaai, Anas Idrissi et Rizki Bekhich - Stagiaires @ M&nbsp;AUTOMOTIV.
