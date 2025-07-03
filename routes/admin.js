const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const config = require('../config')
const router = express.Router();

router.post('/add-user', async (req, res) => {
    try {
        const { email, password, credits, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ error: 'Eksik alan var!' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [result] = await pool.query(
            'INSERT INTO users (email, password_hash, credits, role) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, credits || 0, role]
        );

        console.log(`Yeni kullanıcı eklendi: ${email} ${credits} ${role}`);

        res.status(201).json({ message: 'Kullanıcı başarıyla eklendi', userId: result.insertId });
    } catch (error) {
        console.error('Add user error:', error);
        res.status(500).json({ error: 'Bir hata oluştu' });
    }
});

router.get('/list-users', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, email, credits, role FROM users');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Kullanıcılar alınamadı' });
    }
});




module.exports = router;
