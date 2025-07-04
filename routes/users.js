
const express = require('express');
const pool = require('../db');
const router = express.Router();

router.get('/list-users', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, firstname, lastname, email, credits, role, plan, last_login FROM users');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

module.exports = router;
