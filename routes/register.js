const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const config = require('../config')
const router = express.Router();

const jwt = require('jsonwebtoken');



router.post('/add-user', async (req, res) => {
    const { firstname, lastname, email, password, inviteToken } = req.body;

    try {
        if (inviteToken) {
            const [inviteRows] = await pool.query(
                'SELECT role, inviter_user_id, status FROM invites WHERE token = ?',
                [inviteToken]
            );

            if (inviteRows.length === 0 || inviteRows[0].status === 'accepted') {
                return res.status(400).json({ error: 'Geçersiz veya kullanılmış davet' });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const [userResult] = await pool.query(
            'INSERT INTO users (firstname, lastname, email, password_hash) VALUES (?, ?, ?, ?)',
            [firstname, lastname, email, hashedPassword]
        );

        const userId = userResult.insertId;

        if (inviteToken) {
            await pool.query(
                'UPDATE invites SET status = ? WHERE token = ?',
                ['accepted', inviteToken]
            );
        }

        const token = jwt.sign({ userId }, process.env.JWT_SECRET);
        res.json({
            userId,
            role: inviteToken ? inviteRows[0].role : 'viewer',
            selectedPlan: 'free',
            token
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
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
