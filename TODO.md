ub voila h # TODO

- [ ] Lire les points clés côté token guard (middleware tokenGuard.js + controller checkQuota/getUsage).
- [ ] Préparer un plan de correctif sécurisé :
  - [ ] Forcer l’usage de `req.user.id` et ignorer `req.body.userId`.
  - [ ] Mettre à jour `logDecision` (ne pas dépendre de `userId` venant du body).
  - [ ] Valider/assainir provider/model/input/output.
  - [ ] Ajouter logs et réponses d’erreur cohérentes.
- [x] Confirmer le plan avec l’utilisateur.
- [x] Implémenter les modifications dans :
  - [x] backend/src/middlewares/tokenGuard.js
  - [ ] backend/src/modules/token-guard/tokenController.js

- [ ] Lancer les tests existants (ex: `node test-tickets.js` / autres scripts) et/ou démarrer le backend pour vérifier.




