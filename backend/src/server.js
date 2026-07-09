const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db');
const authRoutes = require('./modules/auth/authRoutes');
const tokenRoutes = require('./modules/token-guard/tokenRoutes');
const msupportRoutes = require('./modules/msupport/routes');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/token', tokenRoutes);
app.use('/api/msupport', msupportRoutes);

app.get('/api', (req, res) => {
    res.json({ message: "Le backend M-IA est opérationnel !" });
});

db.connectDB();

app.listen(port, () => {
    console.log(`Serveur démarré avec succès sur http://localhost:${port}`);
});