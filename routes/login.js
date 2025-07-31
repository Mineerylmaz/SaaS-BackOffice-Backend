const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const router = express.Router();

const SECRET = process.env.JWT_SECRET;

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email ve şifre gerekli' });
    }

    try {
        const [rows] = await pool.query(
            'SELECT id, email, password_hash, role, plan, plan_start_date, plan_end_date, avatar FROM users WHERE email = ?',
            [email]
        );



        const user = rows[0];



        if (!user) {
            return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
        }

        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ error: 'Şifre yanlış' });
        }


        await pool.query(
            'UPDATE users SET last_login = NOW() WHERE id = ?',
            [user.id]
        );
        const [pricingRows] = await pool.query(
            'SELECT name, roles FROM pricing WHERE name = ?',
            [user.plan]
        );

        let plan = null;
        if (pricingRows.length > 0) {
            plan = {
                name: pricingRows[0].name,
                roles: JSON.parse(pricingRows[0].roles) // roles JSON.parse ile parse ediliyor
            };
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            id: user.id,
            email: user.email,
            role: user.role,
            plan: plan,
            token: token,
            plan_start_date: user.plan_start_date,
            plan_end_date: user.plan_end_date,
            avatar: user.avatar,
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

module.exports = router;