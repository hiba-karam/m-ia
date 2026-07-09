const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;
const llmRoutes = require('./modules/llm-gateway/routes');
const msupportRoutes = require('./modules/msupport/routes');
const db = require('./config/db');
const authRoutes = require('./modules/auth/authRoutes');
const tokenRoutes = require('./modules/token-guard/tokenRoutes');



app.use(cors());
app.use(express.json()); 
app.use('/api/auth', authRoutes);
app.use('/api/token', tokenRoutes);
app.use('/api/msupport', msupportRoutes);


app.get('/api', (req, res) => {
    res.json({ message: "Le backend M-IA est opérationnel !" });
});

db.connectDB();

// Vérification simple de la connexion au démarrage
async function checkDb() {
    try {
        const connection = await db.getConnection();
        console.log("✅ Connexion à la base de données XAMPP réussie !");
        connection.release();
    } catch (err) {
        console.error("❌ Erreur de connexion à la base de données :", err.message);
    }
}
checkDb();

app.use('/api/llm', llmRoutes);
app.use('/api/msupport', msupportRoutes);
app.listen(port, () => {
    console.log(`Serveur démarré avec succès sur http://localhost:${port}`);
});
