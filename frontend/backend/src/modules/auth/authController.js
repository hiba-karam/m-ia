const { sql } = require('../../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const request = new sql.Request();
        request.input('email', sql.NVarChar, email);
        const result = await request.query('SELECT * FROM users WHERE email = @email AND is_active = 1');
        if (result.recordset.length === 0) {
            return res.status(401).json({ message: 'Identifiants incorrects.' });
        }
        const user = result.recordset[0];
        if (!user.password_hash) {
            return res.status(403).json({ message: 'Compte non finalise. Contactez le support.' });
        }
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Identifiants incorrects.' });
        }
        const token = jwt.sign(
            { userId: user.id, roleId: user.role_id, email: user.email },
            process.env.JWT_SECRET || 'secret_de_developpement_temporaire',
            { expiresIn: '8h' }
        );
        res.status(200).json({
            message: 'Connexion reussie',
            token,
            user: { id: user.id, name: user.name, email: user.email, role_id: user.role_id }
        });
    } catch (error) {
        console.error('Erreur lors du login:', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
};
module.exports = { login };