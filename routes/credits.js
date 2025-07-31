const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authenticateToken');

router.get('/status', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const [[user]] = await pool.query(
            'SELECT plan, plan_start_date FROM users WHERE id = ?',
            [userId]
        );

        if (!user) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        const [[planInfo]] = await pool.query(
            'SELECT credits FROM pricing WHERE name = ?',
            [user.plan]
        );

        const creditLimit = planInfo?.credits || 0;

        const [[creditUsage]] = await pool.query(
            `SELECT SUM(credit_used) AS used_credits
             FROM credits_logs
             WHERE user_id = ? AND timestamp >= ?`,
            [userId, user.plan_start_date]
        );

        const usedCredits = creditUsage?.used_credits || 0;

        res.json({
            isLimited: usedCredits >= creditLimit,
            usedCredits,
            creditLimit,
        });
    } catch (err) {
        console.error('Kredi durumu alınamadı:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

module.exports = router;
