const express = require('express');
const router = express.Router();
const pool = require('../db');

const authorizeRole = require('../middleware/authorizeRole');


const authenticateToken = require('../middleware/authenticateToken');
const { v4: uuidv4 } = require('uuid');

router.post('/', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    const inviterId = req.user.id;
    const { email, role } = req.body;

    if (!email || !role) {
        return res.status(400).json({ error: 'Email ve rol zorunludur' });
    }

    const token = uuidv4(); // benzersiz token oluştur

    try {
        const [result] = await pool.query(
            'INSERT INTO invites (inviter_user_id, email, role, token, status, invited_at) VALUES (?, ?, ?, ?, ?, NOW())',
            [inviterId, email, role, token, 'pending']
        );

        const inviteId = result.insertId;

        res.json({ success: true, id: inviteId, token }); // 🔥 token'ı da dön
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});




router.get('/', authenticateToken, async (req, res) => {
    const inviterId = req.user.id;

    try {
        const [rows] = await pool.query(
            'SELECT id, email, role, status, invited_at FROM invites WHERE inviter_user_id = ?',
            [inviterId]
        );
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});







router.post("/accept", async (req, res) => {
    const { token } = req.body;

    try {
        const [rows] = await pool.query(
            'SELECT * FROM invites WHERE token = ?',
            [token]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: "Davet bulunamadı" });
        }

        const invite = rows[0];

        if (invite.status === "accepted") {
            return res.status(400).json({ error: "Davet zaten kabul edilmiş" });
        }

        // Durumu güncelle
        await pool.query(
            'UPDATE invites SET status = ? WHERE token = ?',
            ['accepted', token]
        );

        const [userRows] = await pool.query(
            'SELECT id, plan FROM users WHERE id = ?',
            [invite.inviter_user_id]
        );

        const inviterUser = userRows[0];

        res.status(200).json({
            message: "Davet kabul edildi",
            invitedEmail: invite.email,
            role: invite.role,
            inviterUserId: invite.inviter_user_id,
            inviterPlan: inviterUser?.plan || null
        });
    } catch (err) {
        console.error("Davet kabul hatası:", err);
        res.status(500).json({ error: "Sunucu hatası" });
    }
});

router.get('/:token', async (req, res) => {
    const { token } = req.params;

    try {
        const [rows] = await pool.query('SELECT * FROM invites WHERE token = ?', [token]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Davet bulunamadı' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});




module.exports = router;
