
const express = require('express');
const router = express.Router();
const pool = require('../db');


router.get('/settings/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const [rows] = await pool.query('SELECT settings FROM user_settings WHERE user_id = ?', [userId]);
        if (rows.length === 0) return res.json({ settings: {} });
        res.json({ settings: JSON.parse(rows[0].settings) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});


router.put('/settings/:userId', async (req, res) => {
    const { userId } = req.params;
    const { settings } = req.body;
    try {

        const [rows] = await pool.query('SELECT * FROM user_settings WHERE user_id = ?', [userId]);
        if (rows.length === 0) {
            await pool.query('INSERT INTO user_settings (user_id, settings) VALUES (?, ?)', [userId, JSON.stringify(settings)]);
        } else {
            await pool.query('UPDATE user_settings SET settings = ? WHERE user_id = ?', [JSON.stringify(settings), userId]);
        }
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

module.exports = router;
