const jwt = require('jsonwebtoken');
const authConfig = require('../config/auth.config');

function authenticate(required = true) {
    return (req, res, next) => {
        const header = req.headers.authorization;
        if (!header || !header.startsWith('Bearer ')) {
            if (required) {
                return res.status(401).json({ error: 'Token d\'authentification requis.' });
            }
            return next();
        }

        try {
            const token = header.slice(7);
            const payload = jwt.verify(token, authConfig.jwtSecret);
            req.user = payload;
            return next();
        } catch {
            return res.status(401).json({ error: 'Token invalide ou expiré.' });
        }
    };
}

function authorize(...permissions) {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Non authentifié.' });
        }

        const userPerms = req.user.permissions || [];
        if (userPerms.includes('*')) return next();

        const allowed = permissions.some((p) => userPerms.includes(p));
        if (!allowed) {
            return res.status(403).json({ error: 'Accès refusé pour ce rôle.' });
        }
        return next();
    };
}

module.exports = { authenticate, authorize };
