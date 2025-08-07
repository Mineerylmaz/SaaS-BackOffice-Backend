const express = require('express');
const pool = require('../db');
const router = express.Router();
const logger = require('../logger');
function safeParse(jsonString, fallback) {
    try {
        return JSON.parse(jsonString);
    } catch {
        return fallback;
    }
}


function authenticateToken(req, res, next) {
    logger.info("burası")
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);


    const jwt = require('jsonwebtoken');
    const SECRET = process.env.JWT_SECRET;

    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        logger.info("user", user);
        req.user = user;
        next();
    });
}


router.get('/active-plan', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const [userRows] = await pool.query('SELECT plan FROM users WHERE id = ?', [userId]);
        if (userRows.length === 0) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });

        const activePlanName = userRows[0].plan;
        if (!activePlanName) return res.json({ plan: null, settings: {} });

        const [planRows] = await pool.query('SELECT * FROM pricing WHERE name = ?', [activePlanName]);
        if (planRows.length === 0) return res.json({ plan: null, settings: {} });

        const plan = planRows[0];


        plan.features = safeParse(plan.features, {});
        plan.roles = safeParse(plan.roles, []);

        const settings = {};

        res.json({ plan, settings });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

router.put('/avatar', async (req, res) => {
    const { userId, avatar } = req.body;
    try {
        await pool.query('UPDATE users SET avatar = ? WHERE id = ?', [avatar, userId]);
        res.status(200).json({ message: 'Avatar güncellendi' });
    } catch (err) {
        console.error('Avatar güncelleme hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

router.post('/users/delete-account', async (req, res) => {
    const userId = req.body.userId;

    const deletedAt = new Date();

    try {
        await pool.query(
            'UPDATE users SET deleted_at = ? WHERE id = ?',
            [deletedAt, userId]
        );

        res.json({ message: 'Hesap silme işlemi başlatıldı. 30 gün içinde geri dönebilirsiniz.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});





module.exports = router;
