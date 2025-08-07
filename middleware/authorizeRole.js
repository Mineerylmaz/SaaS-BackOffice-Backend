const logger = require('../logger');
function authorizeRole(allowedRoles = []) {
    return (req, res, next) => {
        logger.info("allowedRoles", allowedRoles)
        logger.info("req", req)

        const userRole = req.user.role;
        logger.info("userRole", userRole)

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ error: 'Bu işlemi yapma yetkiniz yok' });
        }
        next();
    };
}
module.exports = authorizeRole;
