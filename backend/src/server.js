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
    res.json({ message: "Le backend M-IA est opÃ©rationnel !" });
});

async function checkDb() {
    try {
        await db.connectDB();
        console.log("Connexion Ã  la base de donnÃ©es SQL Server rÃ©ussie !");
    } catch (err) {
        console.error("Erreur de connexion Ã  la base de donnÃ©es : ", err.message);
    }
}
checkDb();

app.listen(port, () => {
    console.log(`Serveur dÃ©marrÃ© avec succÃ¨s sur http://localhost:${port}`);
});
// Middleware d'erreur global (diagnostic automatique)
app.use((err, req, res, next) => {
    console.error('ERREUR:', err.stack || err.message || err);
    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        success: false,
        error: err.message || 'Erreur interne du serveur',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});
// Gestion des erreurs non capturees
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
