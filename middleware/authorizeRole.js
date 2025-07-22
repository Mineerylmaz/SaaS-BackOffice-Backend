
function authorizeRole(allowedRoles = []) {
    return (req, res, next) => {
        console.log("allowedRoles", allowedRoles)
        console.log("req", req)

        const userRole = req.user.role;
        console.log("userRole", userRole)

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({ error: 'Bu işlemi yapma yetkiniz yok' });
        }
        next();
    };
}
module.exports = authorizeRole;
