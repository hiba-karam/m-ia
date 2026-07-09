const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sql } = require('../../config/db');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ message: "Email et mot de passe requis." });
        }

        const request = new sql.Request();
        const result = await request.query(`SELECT * FROM users WHERE email = '${email}'`);

        if (result.recordset.length === 0) {
            return res.status(401).json({ message: "Identifiants incorrects." });
        }

        const user = result.recordset[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ message: "Identifiants incorrects." });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur interne du serveur." });
    }
};

module.exports = { login };