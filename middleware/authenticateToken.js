require('dotenv').config();

const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET;


function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(401).json({ error: "Token eksik hata authetokeda cnm" });

        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

        const decoded = jwt.verify(token, SECRET);
        req.user = { id: decoded.id, email: decoded.email, role: decoded.role };

        next();
    } catch (error) {
        return res.status(401).json({ error: "Geçersiz token" });
    }
}

module.exports = authenticateToken;
