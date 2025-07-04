const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const router = express.Router();

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email ve şifre gerekli' });
    }

    try {

        const [rows] = await pool.query('SELECT id, email, password_hash, role FROM users WHERE email = ?', [email]);
        const user = rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
        }


        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ error: 'Şifre yanlış' });
        }


        res.json({
            id: user.id,
            email: user.email,
            role: user.role,

        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

module.exports = router;
