const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authenticateToken');
const logger = require('../logger');
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



router.post('/use', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { url } = req.body;

    try {
        const [[user]] = await pool.query(
            'SELECT plan, plan_start_date FROM users WHERE id = ?',
            [userId]
        );

        const [[planInfo]] = await pool.query(
            'SELECT credits FROM pricing WHERE name = ?',
            [user.plan]
        );

        const creditLimit = planInfo?.credits || 0;

        const [[usage]] = await pool.query(
            'SELECT SUM(credit_used) as used FROM credits_logs WHERE user_id = ? AND timestamp >= ?',
            [userId, user.plan_start_date]
        );

        const used = usage?.used || 0;

        if (used >= creditLimit) {
            return res.status(403).json({ message: 'Kredi limitine ulaşıldı.' });
        }

        await pool.query(
            'INSERT INTO credits_logs (user_id, url, timestamp, credit_used) VALUES (?, ?, NOW(), ?)',
            [userId, url, 1]
        );

        res.status(200).json({ message: 'Kredi düşüldü.' });
    } catch (err) {
        console.error('Kredi düşürme hatası:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});





module.exports = router;
