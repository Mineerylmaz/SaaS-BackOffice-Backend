const express = require('express');
const router = express.Router();
const pool = require('../db');
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM pricing');

        const pricing = rows.map(row => ({
            id: row.id,
            name: row.name,
            price: row.price,
            features: JSON.parse(row.features)
        }));
        res.json(pricing);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Veritabanı hatası' });
    }
});


router.put('/', async (req, res) => {
    const newPricing = req.body;

    try {

        await pool.query('DELETE FROM pricing');


        for (const plan of newPricing) {
            await pool.query(
                'INSERT INTO pricing (id, name, price, features) VALUES (?, ?, ?, ?)',
                [plan.id, plan.name, plan.price, JSON.stringify(plan.features)]
            );
        }

        res.json(newPricing);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Veritabanı hatası' });
    }
});

module.exports = router;
