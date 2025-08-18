const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const config = require('../config');
const router = express.Router();
const logger = require('../logger');
require('dotenv').config();

router.post('/add-user', async (req, res) => {
    try {
        const { firstname, lastname, email, password, plan, role } = req.body;

        if (!email || !password || !lastname || !firstname) {
            return res.status(400).json({ error: 'Eksik alan var!' });
        }

        logger.info('Register geldi:', { firstname, lastname, email, plan, role });

        const hashedPassword = await bcrypt.hash(password, 10);

        const roleToInsert = typeof role === 'object' ? role.value || 'user' : role || 'user';
        const planToInsert = plan?.name || null;

        let planStartDate = null;
        let planEndDate = null;


        if (planToInsert) {
            planStartDate = new Date();
            planEndDate = new Date();
            planEndDate.setDate(planStartDate.getDate() + 30);
        }





        const [result] = await pool.query(
            'INSERT INTO users (firstname, lastname, email, password_hash, plan, role, plan_start_date, plan_end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [firstname, lastname, email, hashedPassword, planToInsert, roleToInsert, planStartDate, planEndDate]

        );

        logger.info(`Yeni kullanıcı eklendi: ${firstname} ${lastname} ${email} ${planToInsert} ${roleToInsert}`);

        // Daveti güncelle
        await pool.query(
            "UPDATE invites SET status = 'kabul edildi' WHERE email = ? AND status = 'bekliyor'",
            [email]
        );

        const [pricingRows] = await pool.query(
            `SELECT name, roles, plan_limit, max_file_size, price FROM pricing WHERE name = ?`,
            [planToInsert]
        );

        let planObj = null;
        if (pricingRows.length > 0) {
            const row = pricingRows[0];
            planObj = {
                name: row.name,
                roles: JSON.parse(row.roles),
                plan_limit: typeof row.plan_limit === 'string' ? JSON.parse(row.plan_limit) : row.plan_limit,
                max_file_size: row.max_file_size,
                price: row.price
            };
        }
        const defaultSettings = {
            rt_urls: [],
            static_urls: [],
            autoRenew: false,
            notifications: false,
        };
        await pool.query(
            'INSERT INTO user_settings (user_id, settings) VALUES (?, ?)',
            [result.insertId, JSON.stringify(defaultSettings)]
        );

        const [userRows] = await pool.query(
            'SELECT id, email, role, plan, plan_start_date, plan_end_date, next_plan, plan_change_date, avatar FROM users WHERE id = ?',
            [result.insertId]
        );
        const u = userRows[0];
        const SECRET = process.env.JWT_SECRET;
        const token = jwt.sign(
            { id: result.insertId, email, role: roleToInsert },
            SECRET,
            { expiresIn: '1d' }
        );

        res.status(201).json({
            id: u.id,
            email: u.email,
            role: u.role,
            plan: planObj,                          // zengin plan
            token: token,
            plan_start_date: u.plan_start_date,
            plan_end_date: u.plan_end_date,
            avatar: u.avatar,
            next_plan: u.next_plan,
            plan_change_date: u.plan_change_date,
            customInputValues: {},                  // istersen burada da doldur
        });

    } catch (error) {
        console.error('Add user error:', error);
        res.status(500).json({ error: 'Bir hata oluştu' });
    }
});

module.exports = router;
