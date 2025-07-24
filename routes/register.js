const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const config = require('../config');
const router = express.Router();

router.post('/add-user', async (req, res) => {
    try {
        const { firstname, lastname, email, password, plan, role } = req.body;

        if (!email || !password || !lastname || !firstname) {
            return res.status(400).json({ error: 'Eksik alan var!' });
        }

        // Şifre hashle
        const hashedPassword = await bcrypt.hash(password, 10);

        // Kullanıcıyı ekle
        const [result] = await pool.query(
            'INSERT INTO users (firstname, lastname, email, password_hash, plan, role) VALUES (?, ?, ?, ?, ?, ?)',
            [firstname, lastname, email, hashedPassword, plan, role]
        );

        console.log(`Yeni kullanıcı eklendi: ${firstname} ${lastname} ${email} ${plan}`);

        // Kullanıcının plan detaylarını pricing tablosundan al
        const [pricingRows] = await pool.query(
            'SELECT name, roles FROM pricing WHERE name = ?',
            [plan]
        );

        let planObj = null;
        if (pricingRows.length > 0) {
            planObj = {
                name: pricingRows[0].name,
                roles: JSON.parse(pricingRows[0].roles)
            };
        }


        const defaultSettings = {
            rt_urls: [],
            static_urls: [],
            autoRenew: false,
            notifications: false,
        };
        await pool.query(
            'INSERT INTO user_settings (user_id, settings) VALUES (?, ?)',
            [result.insertId, JSON.stringify(defaultSettings)]
        );


        const SECRET = config.secret || '123';
        const token = jwt.sign(
            { id: result.insertId, email, role },
            SECRET,
            { expiresIn: '1d' }
        );


        res.status(201).json({
            message: 'Kullanıcı başarıyla eklendi',
            user: { id: result.insertId, email, role, plan: planObj },
            token
        });

    } catch (error) {
        console.error('Add user error:', error);
        res.status(500).json({ error: 'Bir hata oluştu' });
    }
});

module.exports = router;
