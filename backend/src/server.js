const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./modules/auth/auth.routes');
const emailRoutes = require('./modules/email/email.routes');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api', (req, res) => {
    res.json({ message: 'Le backend M-IA est opérationnel !' });
});

app.use('/api/auth', authRoutes);
app.use('/api/msupport', emailRoutes);

app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Erreur interne du serveur.' });
});

app.listen(port, () => {
    console.log(`Serveur démarré avec succès sur http://localhost:${port}`);
});
