# Procédure de Déploiement

## Prérequis
- Node.js (v14+)
- SQL Server (Instance active)

## Installation
1. Cloner le dépôt.
2. Accéder au répertoire /backend.
3. Exécuter la commande: npm install.

## Configuration Base de Données
Exécuter les scripts de migration dans l'ordre:
1. 001_create_schema.sql
2. 002_seed_reference_data.sql

## Variables d'Environnement (.env)
Fichier requis à la racine du dossier /backend:
- PORT=3000
- DB_USER=votre_nom_utilisateur
- DB_PASSWORD=votre_mot_de_passe
- DB_SERVER=localhost\SQLEXPRESS
- DB_NAME=M_IA_DB
- JWT_SECRET=votre_cle_secrete_ici

## Lancement
Commande de démarrage: node src/server.js