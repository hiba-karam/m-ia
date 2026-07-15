const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const db = require('./config/db');

const authRoutes = require('./modules/auth/authRoutes');
const emailRoutes = require('./modules/email/emailRoutes');
const tokenRoutes = require('./modules/token-guard/tokenRoutes');
const llmRoutes = require('./modules/llm-gateway/llmRoutes');
const msupportRoutes = require('./modules/msupport/msupportRoutes');
const adminRoutes = require('./modules/admin/adminRoutes');
const ticketRoutes = require('./modules/tickets/ticketRoutes');
const auditRoutes = require('./modules/audit/auditRoutes');

app.use(cors());
app.use(express.json()); 

app.use('/api/auth', authRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/token', tokenRoutes);
app.use('/api/llm', llmRoutes);
app.use('/api/msupport', msupportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/audit', auditRoutes);

app.get('/api', (req, res) => {
    res.json({ message: "Le backend M-IA est opérationnel !" });
});

async function checkDb() {
    try {
        await db.connectDB();
        console.log("Connexion à la base de données SQL Server réussie !");
    } catch (err) {
        console.error("Erreur de connexion à la base de données : ", err.message);
    }
}
checkDb();

app.listen(port, () => {
    console.log(`Serveur démarré avec succès sur http://localhost:${port}`);
});