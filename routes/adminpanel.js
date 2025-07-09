const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');

const router = express.Router();

const crypto = require('crypto');

function generateApiKey() {
    return crypto.randomBytes(20).toString('hex');
}

router.post('/add-user', async (req, res) => {
    try {
        const { email, password, credits, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ error: 'Eksik alan var!' });
        }

        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Bu email zaten kayıtlı!' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);


        let api_key = null;
        if (role === 'developer') {
            api_key = generateApiKey();
        }

        const [result] = await pool.query(
            'INSERT INTO users (email, password_hash, credits, role, api_key) VALUES (?, ?, ?, ?, ?)',
            [email, hashedPassword, credits || 0, role, api_key]
        );

        console.log(`Yeni kullanıcı eklendi: ${email} ${credits} ${role} API Key: ${api_key}`);

        res.status(201).json({ message: 'Kullanıcı başarıyla eklendi', userId: result.insertId, api_key });
    } catch (error) {
        console.error('Add user error:', error);
        res.status(500).json({ error: 'Bir hata oluştu' });
    }
});

router.get('/list-users', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT u.id, u.email, u.credits, u.role, u.plan, u.api_key, u.last_login, u.created_at,
                   us.settings
            FROM users u
            LEFT JOIN user_settings us ON u.id = us.user_id
            WHERE u.deleted = FALSE
        `);

        const users = rows.map(user => ({
            ...user,
            settings: user.settings || {}
        }));

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Kullanıcılar alınamadı' });
    }
});


router.delete('/delete-user/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        await pool.query('UPDATE users SET deleted = TRUE WHERE id = ?', [userId]);
        res.json({ message: 'Kullanıcı silindi' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Kullanıcı silinemedi' });
    }
});

router.get('/deleted-users', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, email, credits, role, last_login, created_at FROM users WHERE deleted = TRUE');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Silinen kullanıcılar alınamadı' });
    }
});




router.put('/update-user-plan/:id', async (req, res) => {
    const userId = req.params.id;
    const { plan } = req.body;

    console.log('Update plan için gelen userId:', userId);
    console.log('Gelen plan:', plan);

    if (!plan) {
        return res.status(400).json({ error: 'Plan bilgisi eksik' });
    }

    try {
        const [rows] = await pool.query('SELECT role, api_key FROM users WHERE id = ?', [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        let api_key = rows[0].api_key;
        if (rows[0].role === 'developer' && !api_key) {
            api_key = generateApiKey();
        }

        const [result] = await pool.query(
            'UPDATE users SET plan = ?, api_key = ? WHERE id = ?',
            [plan, api_key, userId]
        );

        console.log('UPDATE sonucu:', result);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        res.json({ message: 'Plan ve API anahtarı başarıyla güncellendi', api_key });
    } catch (error) {
        console.error('Plan güncelleme hatası:', error);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});








module.exports = router;
