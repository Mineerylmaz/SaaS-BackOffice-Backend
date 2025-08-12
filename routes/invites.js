const express = require('express');
const router = express.Router();
const pool = require('../db');
const authorizeRole = require('../middleware/authorizeRole');
const authenticateToken = require('../middleware/authenticateToken');
const { v4: uuidv4 } = require('uuid');
const logger = require('../logger');
router.post('/', authenticateToken, authorizeRole(['admin', 'user', 'superadmin']), async (req, res) => {
    const inviterId = req.user.id;
    const { email, role } = req.body;

    if (!email || !role) {
        return res.status(400).json({ error: 'Email ve rol zorunludur' });
    }

    const token = uuidv4();

    try {
        const [result] = await pool.query(
            'INSERT INTO invites (inviter_user_id, email, role, token, status, invited_at) VALUES (?, ?, ?, ?, ?, NOW())',
            [inviterId, email, role, token, 'pending']
        );

        const inviteId = result.insertId;
        res.json({ success: true, id: inviteId, token });
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

        await pool.query(
            'UPDATE invites SET status = ? WHERE token = ?',
            ['accepted', token]
        );

        res.status(200).json({ success: true });
    } catch (err) {
        console.error("Davet kabul hatası:", err);
        res.status(500).json({ error: "Sunucu hatası" });
    }
});

router.get('/:token', async (req, res) => {
    const { token } = req.params;

    try {
        const [rows] = await pool.query(
            'SELECT * FROM invites WHERE token = ?',
            [token]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Davet bulunamadı' });
        }

        res.json(rows[0]);
    } catch (err) {
        console.error('Invite token fetch error:', err);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

router.delete('/:email', authenticateToken, async (req, res) => {
    logger.info('delete işlemi başladı')
    const inviterId = req.user.id;
    const invitedEmail = req.params.email;

    const [rows] = await pool.query(
        'SELECT * FROM invites WHERE email = ? AND inviter_user_id = ?',
        [invitedEmail, inviterId]
    );

    if (rows.length === 0) {
        return res.status(404).json({ error: "Davet bulunamadı" });
    }

    await pool.query(
        `UPDATE users 
     SET plan = NULL, plan_start_date = NULL, plan_end_date = NULL , role = 'user'
     WHERE email = ?`,
        [invitedEmail]
    );

    await pool.query(
        'DELETE FROM invites WHERE email = ? AND inviter_user_id = ?',
        [invitedEmail, inviterId]
    );

    res.status(200).json({ message: "Davet silindi ve kullanıcı basic plana geçirildi" });
});

router.get('/by-inviter/:inviterEmail', authenticateToken, async (req, res) => {
    const inviterEmail = req.params.inviterEmail;

    try {
        const [rows] = await pool.query(
            'SELECT * FROM invites WHERE inviter_email = ?',
            [inviterEmail]
        );

        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});



module.exports = router;