const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const router = express.Router();
const logger = require('../logger');
const SECRET = process.env.JWT_SECRET;

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email ve şifre gerekli' });
    }

    try {
        const [rows] = await pool.query(
            'SELECT id, email, password_hash, role, plan, plan_start_date, plan_end_date, avatar, deleted,next_plan, plan_change_date FROM users WHERE email = ?',
            [email]
        );

        const user = rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
        }


        if (user.deleted === 1) {
            return res.status(403).json({ error: 'Bu kullanıcı silinmiş.' });
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
        const [userTabRows] = await pool.query(
            'SELECT key_name, value FROM user_tab WHERE user_id = ?',
            [user.id]
        );


        const customInputValues = {};
        userTabRows.forEach(row => {
            customInputValues[row.key_name] = row.value;
        });


        let plan = null;
        if (pricingRows.length > 0) {
            plan = {
                name: pricingRows[0].name,
                roles: JSON.parse(pricingRows[0].roles)
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
            plan: plan || null,
            token: token,
            plan_start_date: user.plan_start_date,
            plan_end_date: user.plan_end_date,
            avatar: user.avatar,
            next_plan: user.next_plan,
            plan_change_date: user.plan_change_date,
            customInputValues: customInputValues
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

module.exports = router;