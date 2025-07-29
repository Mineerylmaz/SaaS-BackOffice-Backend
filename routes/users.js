const express = require('express');
const pool = require('../db');
const router = express.Router();

// JSON parse fonksiyonu - güvenli
function safeParse(jsonString, fallback) {
    try {
        return JSON.parse(jsonString);
    } catch {
        return fallback;
    }
}

// Örnek auth middleware (senin projene göre düzenle)
function authenticateToken(req, res, next) {
    console.log("burası")
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    // jwt doğrulama (SECRET senin belirlediğin)
    const jwt = require('jsonwebtoken');
    const SECRET = process.env.JWT_SECRET;

    jwt.verify(token, SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        console.log("user", user);
        req.user = user;
        next();
    });
}

// Kullanıcının aktif planını dönen endpoint (auth ile)
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



module.exports = router;
