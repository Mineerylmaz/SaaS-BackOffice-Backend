
const express = require('express');
const router = express.Router();
const pool = require('../db');

router.put('/profile/:userId', async (req, res) => {
    const { userId } = req.params;
    const { email, notifications } = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE users SET email = ?, notifications = ? WHERE id = ?',
            [email, notifications ? 1 : 0, userId]
        );
        console.log('Email update result:', result);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    } a
});
const bcrypt = require('bcrypt');

router.put('/password/:userId', async (req, res) => {
    const { userId } = req.params;
    const { oldPassword, newPassword } = req.body;

    try {

        const [rows] = await pool.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        const valid = await bcrypt.compare(oldPassword, rows[0].password_hash);
        if (!valid) {
            return res.status(400).json({ error: 'Eski şifre hatalı' });
        }


        const newHash = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);

        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});





router.get('/settings/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const [rows] = await pool.query(`
  SELECT 
  u.id,
  u.plan,
  us.settings,
  p.rt_url_limit,
  p.static_url_limit
FROM 
  users u
  LEFT JOIN user_settings us ON u.id = us.user_id
  LEFT JOIN pricing p ON u.plan COLLATE utf8mb4_general_ci = p.name COLLATE utf8mb4_general_ci
WHERE 
  u.id = ?;






    `, [userId]);

        if (rows.length === 0) {
            return res.json({
                settings: {},
                plan: null,
            });
        }

        const row = rows[0];

        res.json({
            settings: row.settings,
            plan: {
                name: row.plan,
                rt_url_limit: row.rt_url_limit,
                static_url_limit: row.static_url_limit,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});
router.get('/urlResults/:userId', async (req, res) => {
    const { userId } = req.params;
    const { start, end } = req.query;

    try {
        let query = `
          SELECT id, name, url, type, response_time AS responseTime, status, checked_at AS checkedAt, error_message AS errorMessage
          FROM url_status
          WHERE user_id = ?
        `;
        const params = [userId];

        if (start && end) {
            query += ` AND checked_at BETWEEN ? AND ?`;
            params.push(start, end);
        }

        query += ` ORDER BY checked_at DESC`;

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});


router.post('/urlResults', async (req, res) => {
    const { userId, name, url, type, responseTime, status, checkedAt, errorMessage } = req.body;

    try {
        await pool.query(
            `INSERT INTO url_status
        (user_id, name, url, type, response_time, status, checked_at, error_message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, name, url, type, responseTime, status, checkedAt, errorMessage]
        );

        res.json({ success: true });
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