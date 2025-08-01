const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authenticateToken');
router.post('/', authenticateToken, async (req, res) => {
    const isSuperAdmin = req.user.role === 'superadmin';

    const user_id = isSuperAdmin && req.body.user_id ? req.body.user_id : req.user.id;
    const settings = req.body.settings;

    try {
        for (const setting of settings) {
            await pool.query(
                'DELETE FROM user_tab WHERE user_id = ? AND key_name = ?',
                [user_id, setting.key_name]
            );

            await pool.query(
                'INSERT INTO user_tab (user_id, key_name, value) VALUES (?, ?, ?)',
                [user_id, setting.key_name, setting.value]
            );
        }

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Ayarlar kaydedilemedi' });
    }
});

router.get('/', authenticateToken, async (req, res) => {
    const isSuperAdmin = req.user.role === 'superadmin';
    const user_id = isSuperAdmin && req.query.user_id ? Number(req.query.user_id) : req.user.id;


    try {
        const [rows] = await pool.query(
            'SELECT key_name, value FROM user_tab WHERE user_id = ?',
            [user_id]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Kullanıcı ayarları getirilemedi' });
    }
});



module.exports = router;
