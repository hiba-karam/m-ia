const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); 

app.get('/api', (req, res) => {
    res.json({ message: "Le backend M-IA est opérationnel !" });
});

app.listen(port, () => {
    console.log(`Serveur démarré avec succès sur http://localhost:${port}`);
});