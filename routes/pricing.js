const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authenticateToken');
const authorizeRole = require('../middleware/authorizeRole');
const logger = require('../logger');


router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM pricing');

        const parsedRows = rows.map((row) => {
            let roles = row.roles;
            let metotlar = row.metotlar;
            let plan_limit = row.plan_limit;

            if (typeof roles === 'string') {
                try {
                    roles = JSON.parse(roles);
                } catch (e) {
                    console.warn(`roles parse edilemedi: ${roles}`);
                    roles = [];
                }
            }

            if (typeof metotlar === 'string') {
                try {
                    metotlar = JSON.parse(metotlar);
                } catch (e) {
                    console.warn(`metotlar parse edilemedi: ${metotlar}`);
                    metotlar = [];
                }
            }

            if (typeof plan_limit === 'string') {
                try {
                    plan_limit = JSON.parse(plan_limit);
                } catch (e) {
                    console.warn(`plan_limit parse edilemedi: ${plan_limit}`);
                    plan_limit = {};
                }
            }

            return {
                ...row,
                roles,
                metotlar,
                plan_limit
            };
        });

        res.json(parsedRows);
    } catch (error) {
        console.error('Pricing GET error:', error);
        res.status(500).json({ error: 'Veritabanı hatası' });
    }
});


router.put('/', authenticateToken, authorizeRole(['superadmin']), async (req, res) => {
    const pricingList = req.body;

    try {

        await pool.query('DELETE FROM pricing');

        for (const plan of pricingList) {
            logger.info('Plan kaydediliyor:', plan);
            await pool.query(
                `INSERT INTO pricing 
                 (name, price, features, plan_limit, max_file_size, roles, credits, metotlar) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    plan.name,
                    plan.price,
                    JSON.stringify(plan.features || {}),
                    JSON.stringify(plan.plan_limit || {}),
                    plan.max_file_size || 0,
                    JSON.stringify(plan.roles || []),
                    plan.credits || 0,
                    JSON.stringify(plan.metotlar || [])
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
