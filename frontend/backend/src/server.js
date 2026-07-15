const express = require('express');
const { connectDB } = require('./config/db');
require('dotenv').config();
const db = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes d'Anass (Auth & Token)
const authRoutes = require('./modules/auth/authRoutes');
app.use('/api/auth', authRoutes);
const tokenRoutes = require('./modules/token-guard/tokenRoutes');
app.use('/api/token', tokenRoutes);

// Routes de Chaimaa (LLM & M-support)
const llmRoutes = require('./modules/llm-gateway/routes');
const msupportRoutes = require('./modules/msupport/routes');
app.use('/api/llm', llmRoutes);
app.use('/api/msupport', msupportRoutes);

app.get('/api', (req, res) => {
    res.json({ message: "Le backend M-IA est opérationnel !" });
});



app.listen(PORT, async () => {
    console.log(`Serveur démarré avec succès sur http://localhost:${PORT}`);
    if (db.connectDB) {
        await db.connectDB(); // SQL Server (Anass)
    }
});
