const pool = require('../db');

module.exports = async (req, res, next) => {
    const userId = req.params.userId || req.body.userId;

    try {
        const [rows] = await pool.query('SELECT role FROM users WHERE id = ?', [userId]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        if (rows[0].role === 'superadmin') {
            return res.status(403).json({ error: 'Superadmin güncellenemez' });
        }

        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Sunucu hatası' });
    }
};

