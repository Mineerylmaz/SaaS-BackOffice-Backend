const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');

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
        const [rows] = await pool.query('SELECT id, email, credits, role FROM users WHERE deleted = TRUE');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Silinen kullanıcılar alınamadı' });
    }
});

module.exports = router;
