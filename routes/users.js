const express = require('express');
const pool = require('../db');
const router = express.Router();

router.get('/list-users', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, firstname, lastname, email, credits, role, plan, last_login,created_at FROM users');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});
router.get('/:userId/active-plan', async (req, res) => {
    const { userId } = req.params;
    try {

        const [userRows] = await pool.query('SELECT plan FROM users WHERE id = ?', [userId]);
        if (userRows.length === 0) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });

        const activePlanId = userRows[0].plan;

        if (!activePlanId) return res.json({ plan: null, settings: {} });


        const [planRows] = await pool.query('SELECT * FROM pricing WHERE name = ?', [activePlanId]);

        if (planRows.length === 0) return res.json({ plan: null, settings: {} });

        const plan = planRows[0];


        plan.features = JSON.parse(plan.features);


        const settings = {};

        res.json({ plan, settings });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});


module.exports = router; 