
const express = require('express');
const router = express.Router();
const axios = require('axios');
const pool = require('../db');


router.get('/:method', async (req, res) => {
    const userId = req.user.id;
    const { method } = req.params;
    const queryParams = req.query;

    try {

        const [userRows] = await pool.query('SELECT plan, used_credits FROM users WHERE id = ?', [userId]);
        const [planRow] = await pool.query('SELECT credits FROM pricing WHERE name = ?', [userRows[0].plan]);

        if (userRows[0].used_credits >= planRow.credits) {
            return res.status(403).json({ error: 'Kredi limitiniz doldu' });
        }

        const pisUrl = `https://pis.service.com/${method}`;
        const response = await axios.get(pisUrl, { params: queryParams });


        await pool.query('INSERT INTO credits_logs (user_id, url, timestamp, credit_used) VALUES (?, ?, NOW(), ?)', [userId, pisUrl, 1]);
        await pool.query('UPDATE users SET used_credits = used_credits + 1 WHERE id = ?', [userId]);

        return res.json(response.data);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Sunucu hatası' });
    }
});

module.exports = router;
