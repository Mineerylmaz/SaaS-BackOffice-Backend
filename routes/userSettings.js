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






router.get('/settings/:userId', authenticateToken, authorizeRole(['admin', 'editor', 'user', 'superadmin', 'viewer']), restrictSuperadminUpdate, async (req, res) => {
    let { userId } = req.params;

    if (req.user.role === 'viewer') {
        const [inviteRows] = await pool.query(
            'SELECT inviter_user_id FROM invites WHERE email = ? ',
            [req.user.email]
        );
        if (inviteRows.length) {
            userId = inviteRows[0].inviter_user_id;
        }
    }
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
    p.plan_limit,
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
            id: row.id,
            settings: row.settings,
            plan: {
                name: row.plan,
                plan_limit: typeof row.plan_limit === 'string'
                    ? JSON.parse(row.plan_limit || '{}')
                    : (row.plan_limit || {}),

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


router.get('/userInputs/:userId', authenticateToken, authorizeRole(['admin', 'editor', 'user', 'superadmin']), restrictSuperadminUpdate, async (req, res) => {
    const { userId } = req.params;

    try {
        const [rows] = await pool.query(
            'SELECT key_name, value FROM user_tab WHERE user_id = ?',
            [userId]
        );

        if (!rows.length) return res.json({ rtUrls: [], staticUrls: [], allInputs: {} });

        const allInputs = {};
        const rtUrls = [];
        const staticUrls = [];

        rows.forEach(row => {
            allInputs[row.key_name] = row.value;

            if (row.key_name.startsWith('rt_url_limit')) {
                rtUrls.push({ key: row.key_name, value: row.value });
            }
            if (row.key_name.startsWith('static_url_limit')) {
                staticUrls.push({ key: row.key_name, value: row.value });
            }
        });

        res.json({ rtUrls, staticUrls, allInputs });
    } catch (err) {
        console.error('User inputs çekilirken hata:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});



router.get('/urlResults/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const [settingsRows] = await pool.query(
            'SELECT settings FROM user_settings WHERE user_id = ?',
            [userId]
        );

        if (!settingsRows.length) {
            return res.status(404).json({ error: 'Kullanıcı ayarları bulunamadı' });
        }

        let settings = settingsRows[0].settings;
        if (typeof settings === 'string') {
            try { settings = JSON.parse(settings); }
            catch { settings = {}; }
        }


        let rtUrls = Array.isArray(settings.rt_urls) ? settings.rt_urls : [];
        let staticUrls = Array.isArray(settings.static_urls) ? settings.static_urls : [];

        Object.entries(settings).forEach(([key, value]) => {
            if (!value) return;
            if (key.startsWith('rt_url_limit') || key === 'Rt Url 1') {
                rtUrls.push({ name: key, url: value, type: 'rt' });
            }
            if (key.startsWith('static_url_limit') || key === 'Static Url 1') {
                staticUrls.push({ name: key, url: value, type: 'static' });
            }
        });

        const urls = [...rtUrls, ...staticUrls];

        if (!urls.length) return res.json({ data: [] });

        const results = urls.map(entry => ({
            id: crypto.randomUUID(),
            name: entry.name || 'Başlıksız',
            url: entry.url,
            type: entry.type || 'unknown',
            responseTime: Math.floor(Math.random() * 500),
            status: 'success',
            errorMessage: null,
            checkedAt: new Date().toISOString()
        }));

        res.json(results);
    } catch (err) {
        console.error('URL sonuçları çekilirken hata:', err);
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

router.get("/full-keys/:userId", async (req, res) => {
    const { userId } = req.params;

    try {

        const [userRows] = await pool.query(`
            SELECT u.plan, p.plan_limit
            FROM users u
            LEFT JOIN pricing p 
                ON u.plan COLLATE utf8mb4_general_ci = p.name COLLATE utf8mb4_general_ci
            WHERE u.id = ?
        `, [userId]);

        if (!userRows.length) {
            return res.status(404).json({ error: "Kullanıcı veya plan bulunamadı" });
        }

        const userPlan = userRows[0];
        let planLimit = {};

        try {
            if (typeof userPlan.plan_limit === 'string') {
                planLimit = JSON.parse(userPlan.plan_limit || '{}');
            } else if (typeof userPlan.plan_limit === 'object' && userPlan.plan_limit !== null) {
                planLimit = userPlan.plan_limit;
            } else {
                planLimit = {};
            }
        } catch (err) {
            console.error('Plan limit parse hatası:', err);
            planLimit = {};
        }

        const [baseKeys] = await pool.query(`
            SELECT key_name, type, required, description, is_repeatable
            FROM setting_keys
        `);

        let finalKeys = [];

        baseKeys.forEach(key => {
            if (key.is_repeatable) {
                let limit = 1;

                for (const [limitKey, limitValue] of Object.entries(planLimit)) {
                    if (key.key_name.toLowerCase().includes(limitKey.toLowerCase())) {
                        limit = limitValue;
                        break;
                    }
                }

                for (let i = 1; i <= limit; i++) {
                    finalKeys.push({
                        ...key,
                        key_name: `${key.key_name}_${i}`,
                        description: `${key.description} ${i}`
                    });
                }
            } else {
                finalKeys.push(key);
            }

        });

        res.json(finalKeys);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Sunucu hatası" });
    }
});





module.exports = router;