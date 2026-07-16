// test-tickets.js
// Script de diagnostic pour la page "mes tickets"
// Usage : node test-tickets.js

const http = require('http');

// ⚠️ Adapte cette route si le nom est différent dans ton server.js (ex: /api/tickets)
const url = 'http://localhost:5000/api/tickets';

console.log(`Test de la route tickets : ${url}\n`);

http.get(url, (res) => {
  let data = '';

  console.log(`Code de statut HTTP : ${res.statusCode}`);

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode === 200) {
      try {
        const json = JSON.parse(data);
        console.log(`✅ La route répond correctement.`);
        console.log(`Nombre de tickets reçus : ${Array.isArray(json) ? json.length : 'format inattendu'}`);
        console.log('Aperçu des données :', JSON.stringify(json, null, 2).slice(0, 500));
      } catch (e) {
        console.log('⚠️ La route répond mais les données ne sont pas du JSON valide :');
        console.log(data.slice(0, 500));
      }
    } else if (res.statusCode === 404) {
      console.log('❌ Route introuvable (404). La route /api/tickets n\'existe probablement pas dans server.js.');
    } else if (res.statusCode === 500) {
      console.log('❌ Erreur serveur (500). Problème côté backend (souvent une erreur SQL). Réponse :');
      console.log(data);
    } else {
      console.log(`⚠️ Réponse inattendue :`, data);
    }
  });
}).on('error', (err) => {
  console.error('❌ Impossible de joindre le backend du tout :', err.message);
  console.error('   Vérifie que "node server.js" tourne bien sur le port 5000.');
});