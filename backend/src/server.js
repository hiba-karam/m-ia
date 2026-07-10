const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');
const authRoutes = require('./modules/auth/auth.routes');
const emailRoutes = require('./modules/email/email.routes');
const tokenRoutes = require('./modules/token-guard/tokenRoutes');
const llmRoutes = require('./modules/llm-gateway/llmRoutes');
const msupportRoutes = require('./modules/msupport/msupportRoutes');
const adminRoutes = require('./modules/admin/adminRoutes');
const ticketRoutes = require('./modules/tickets/ticketRoutes');
const auditRoutes = require('./modules/audit/auditRoutes');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api', (req, res) => {
    res.json({ message: 'Le backend M-IA est opérationnel !' });
});

app.use('/api/auth', authRoutes);
app.use('/api/token', tokenRoutes);
app.use('/api/llm', llmRoutes);
app.use('/api/msupport', msupportRoutes);
app.use('/api/msupport', emailRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/audit', auditRoutes);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
});

async function checkDb() {
    try {
        await db.connectDB();
        console.log('Connexion à la base de données réussie !');
    } catch (err) {
        console.error('Erreur de connexion à la base de données : ', err.message);
    }
}
checkDb();

app.listen(port, () => {
    console.log(`Serveur démarré avec succès sur http://localhost:${port}`);
});
