const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM pricing');
        res.json(rows);
    } catch (error) {
        console.error('Pricing GET error:', error);
        res.status(500).json({ error: 'Veritabanı hatası' });
    }
});


router.put('/', async (req, res) => {
    const pricingList = req.body;

    try {

        await pool.query('DELETE FROM pricing');


        for (const plan of pricingList) {
            console.log('Plan kaydediliyor:', plan);
            await pool.query(
                'INSERT INTO pricing (name, price, features, rt_url_limit, static_url_limit, max_file_size,roles) VALUES (?, ?, ?, ?, ?, ?,?)',
                [
                    plan.name,
                    plan.price,
                    JSON.stringify(plan.features),
                    plan.rt_url_limit || 0,
                    plan.static_url_limit || 0,
                    plan.max_file_size || 0,
                    JSON.stringify(plan.roles || [])
                ]
            );

        }



        res.json(pricingList);
    } catch (error) {
        console.error('Pricing PUT error:', error);
        res.status(500).json({ error: 'Fiyatlar güncellenemedi' });
    }
});

module.exports = router;
