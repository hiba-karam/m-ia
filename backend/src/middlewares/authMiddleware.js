const jwt = require('jsonwebtoken');
const authConfig = require('../config/authConfig');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ message: "Accès refusé. Token manquant." });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, authConfig.jwtSecret);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Token invalide ou expiré." });
    }
};

const authorize = (...permissions) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Non authentifié.' });
        }

        let permsArray = [];
        if (Array.isArray(req.user.permissions)) {
            permsArray = req.user.permissions;
        } else if (typeof req.user.permissions === 'object' && req.user.permissions !== null) {
            permsArray = Object.keys(req.user.permissions).filter(k => req.user.permissions[k] === true);
        }

        if (permsArray.includes('*') || permsArray.includes('all')) return next();

        const allowed = permissions.some((p) => permsArray.includes(p));
        if (!allowed) {
            return res.status(403).json({ error: 'Accès refusé pour ce rôle.' });
        }
        return next();
    };
};

module.exports = { verifyToken, authorize };