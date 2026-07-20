ub voila h # TODO

- [x] Lire les points clés côté token guard (middleware tokenGuard.js + controller checkQuota/getUsage).
- [x] Préparer un plan de correctif sécurisé :
  - [x] Forcer l’usage de `req.user.id` et ignorer `req.body.userId`.
  - [x] Mettre à jour `logDecision` (ne pas dépendre de `userId` venant du body).
  - [x] Valider/assainir provider/model/input/output.
  - [x] Ajouter logs et réponses d’erreur cohérentes.
- [x] Confirmer le plan avec l’utilisateur.
- [x] Implémenter les modifications dans :
  - [x] backend/src/middlewares/tokenGuard.js
  - [x] backend/src/modules/token-guard/tokenController.js

- [ ] Lancer les tests existants (ex: `node test-tickets.js`) et/ou démarrer le backend pour vérifier.




