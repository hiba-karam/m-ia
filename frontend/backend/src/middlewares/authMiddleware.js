const jwt = require('jsonwebtoken');
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; 
    if (!token) {
        return res.status(403).json({ message: 'Un token est requis pour l\'authentification' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_de_developpement_temporaire');
        req.user = decoded; 
        next(); 
    } catch (err) {
        return res.status(401).json({ message: 'Token invalide ou expiré' });
    }
};
module.exports = verifyToken;