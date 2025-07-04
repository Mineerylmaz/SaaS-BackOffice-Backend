const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const config = require('../config')
const router = express.Router();

router.post('/add-user', async (req, res) => {
    try {
        const { firstname, lastname, email, password, plan = 'free', role = 'free' } = req.body;

        if (!email || !password || !lastname || !firstname) {
            return res.status(400).json({ error: 'Eksik alan var!' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            'INSERT INTO users (firstname, lastname, email, password_hash, plan, role) VALUES (?, ?, ?, ?, ?, ?)',
            [firstname, lastname, email, hashedPassword, plan, role]
        );

        console.log(`Yeni kullanıcı eklendi: ${firstname} ${lastname} ${email} ${plan} `);

        res.status(201).json({ message: 'Kullanıcı başarıyla eklendi', userId: result.insertId });
    } catch (error) {
        console.error('Add user error:', error);
        res.status(500).json({ error: 'Bir hata oluştu' });
    }
});


router.get('/list-users', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, firstname, lastname, email, credits, role, plan, last_login,created_at FROM users');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Kullanıcılar alınamadı' });
    }
});





module.exports = router;
