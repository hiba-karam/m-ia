# m-ia

Dépôt du projet M-IA (voir `Business_Plan_M-IA.pdf` pour le cadrage complet).

Structure conforme à la section 10.2 du business plan :

```
/m-ia
  /frontend    ✅ Complet (React + Vite) — voir frontend/README.md
  /backend     ⏳ Non traité ici (à fusionner avec le travail de l'équipe backend)
  /database    ⏳ Scripts SQL Server à ajouter (voir section 11 du business plan)
  /docs        ⏳ architecture.md / api.md / deployment.md à rédiger
```

## Frontend

Le dossier `frontend/` est un projet React + Vite fonctionnel et autonome, avec :
- Login (SSO + compte de secours local)
- Chat IA (historique conversations, sélecteur de modèle, pièces jointes)
- Dashboard DSI (KPI, consommation tokens, budgets par service)
- Tickets (liste + détail email/analyse IA/réponse API)
- Administration (fournisseurs IA, quotas, rôles & SSO, boîte M-support)

Toutes les données sont actuellement simulées dans `frontend/src/services/api/`.
Voir `frontend/README.md` pour les instructions d'installation et le détail de ce
qu'il faut changer pour brancher le vrai backend.

## Pour fusionner avec le dépôt GitHub existant

Si ce dossier `frontend/` doit remplacer ou compléter un frontend déjà présent dans
votre dépôt `github.com/hiba-karam/m-ia` :

1. Comparez d'abord les deux versions (surtout si vos coéquipiers ont déjà commencé
   `frontend/src/App.jsx`, `services/`, etc.) pour ne rien écraser d'important.
2. Le plus sûr : ouvrez votre dépôt réel dans **VS Code avec l'extension Claude Code**,
   collez ce dossier à côté, et demandez une fusion assistée fichier par fichier.
