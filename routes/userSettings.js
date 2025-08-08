const restrictSuperadminUpdate = require('../middleware/restrictSuperadminUpdate');
const crypto = require('crypto');
const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authenticateToken');
const authorizeRole = require('../middleware/authorizeRole');
const { mock_server_url } = require('../config');
const logger = require('../logger');

router.put('/profile/:userId', authenticateToken, authorizeRole(['admin', 'editor', 'user']), restrictSuperadminUpdate, async (req, res) => {
    const { userId } = req.params;
    const { email, notifications } = req.body;

    try {
        const [result] = await pool.query(
            'UPDATE users SET email = ?, notifications = ? WHERE id = ?',
            [email, notifications ? 1 : 0, userId]
        );
        logger.info('Email update result:', result);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});
const bcrypt = require('bcrypt');






router.get('/settings/:userId', authenticateToken, authorizeRole(['admin', 'editor', 'user', 'superadmin']), restrictSuperadminUpdate, async (req, res) => {
    const { userId } = req.params;
    const [customInputsRows] = await pool.query(
        'SELECT key_name, value FROM user_tab WHERE user_id = ?',
        [userId]
    );

    const customInputs = {};
    customInputsRows.forEach(row => {
        customInputs[row.key_name] = row.value;
    });

    try {
        const [rows] = await pool.query(`
  SELECT 
    u.id,
    u.plan,
    us.settings,
    p.rt_url_limit,
    p.static_url_limit,
    p.max_file_size  ,
    p.roles
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
                max_file_size: row.max_file_size,
                roles: row.roles
            },
            customInputs
        });


    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});




router.get('/urlResults/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const [settingsRows] = await pool.query('SELECT settings FROM user_settings WHERE user_id = ?', [userId]);
        if (!settingsRows.length) {
            return res.status(404).json({ error: 'Kullanıcı ayarları bulunamadı' });
        }

        const settings = (settingsRows[0].settings || '{}');
        const urls = [
            ...(settings.rt_urls || []),
            ...(settings.static_urls || [])
        ];

        if (urls.length === 0) {
            return res.json({ data: [] });
        }

        const results = await Promise.all(urls.map(async (entry) => {
            try {
                const response = await fetch(mock_server_url);
                const text = await response.text();
                logger.info('Mock sunucudan gelen ham cevap:', text);

                let data;
                try {
                    data = JSON.parse(text);
                } catch (e) {
                    console.error('JSON parse hatası:', text);
                    data = {};
                }

                return {
                    id: crypto.randomUUID(),
                    name: entry.name || 'Başlıksız',
                    url: entry.url,
                    type: entry.type || 'unknown',
                    responseTime: data.responseTime || Math.floor(Math.random() * 500),
                    status: data.status || 'error',
                    errorMessage: data.status === 'error' ? data.message || 'Bilinmeyen hata' : null,
                    checkedAt: data.checkedAt || new Date().toISOString()
                };
            } catch (err) {
                console.error('Fetch hatası:', err);
                return {
                    id: crypto.randomUUID(),
                    name: entry.name || 'Başlıksız',
                    url: entry.url,
                    type: entry.type || 'unknown',
                    responseTime: null,
                    status: 'error',
                    errorMessage: 'Mock çağrısı başarısız',
                    checkedAt: new Date().toISOString()
                };
            }
        }));

        res.json(results);
    } catch (err) {
        console.error('Mock çağrıları sırasında hata:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});




router.post('/urlResults', authenticateToken, authorizeRole(['admin', 'editor', 'user']), restrictSuperadminUpdate, async (req, res) => {
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



router.put('/settings/:userId', restrictSuperadminUpdate, async (req, res) => {
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
router.delete('/settings/url/:userId', authenticateToken, authorizeRole(['admin', 'user',]), restrictSuperadminUpdate, async (req, res) => {
    const { userId } = req.params;
    const { url, type } = req.body;

    try {
        const [rows] = await pool.query('SELECT settings FROM user_settings WHERE user_id = ?', [userId]);
        if (!rows.length) return res.status(404).json({ error: 'Settings bulunamadı' });

        const settings = JSON.parse(rows[0].settings || '{}');

        if (type === 'rt') {
            settings.rt_urls = (settings.rt_urls || []).filter(item => item.url !== url);
        } else if (type === 'static') {
            settings.static_urls = (settings.static_urls || []).filter(item => item.url !== url);
        } else {
            return res.status(400).json({ error: 'Geçersiz URL tipi' });
        }

        await pool.query('UPDATE user_settings SET settings = ? WHERE user_id = ?', [JSON.stringify(settings), userId]);
        await pool.query('INSERT INTO deleted_urls (user_id, url, type, deleted_at) VALUES (?, ?, ?, NOW())', [userId, url, type]);
        logger.info('Deleted URL kayıt ediliyor:', { userId, url, type });


        res.json({ success: true, settings });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});



module.exports = router;