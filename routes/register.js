const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const config = require('../config');
const router = express.Router();
require('dotenv').config();
router.post('/add-user', async (req, res) => {
    try {
        const { firstname, lastname, email, password, plan, role } = req.body;

        if (!email || !password || !lastname || !firstname) {
            return res.status(400).json({ error: 'Eksik alan var!' });
        }

        console.log('Register geldi:', { firstname, lastname, email, plan, role });


        const hashedPassword = await bcrypt.hash(password, 10);
        const planStartDate = new Date();
        const planEndDate = new Date();
        planEndDate.setDate(planStartDate.getDate() + 30);



        const roleToInsert = typeof role === 'object' ? role.value || 'user' : role || 'user';


        //const planToInsert = typeof plan === 'object' ? plan?.name : plan || null;
        const planToInsert = plan?.name || 'basic';



        const [result] = await pool.query(
            'INSERT INTO users (firstname, lastname, email, password_hash, plan, role, plan_start_date, plan_end_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [firstname, lastname, email, hashedPassword, planToInsert, roleToInsert, planStartDate, planEndDate]
        );


        console.log(`Yeni kullanıcı eklendi: ${firstname} ${lastname} ${email} ${planToInsert} ${roleToInsert}`);
        await pool.query(
            "UPDATE invites SET status = 'kabul edildi' WHERE email = ? AND status = 'bekliyor'",
            [email]
        );
        const [pricingRows] = await pool.query(
            `SELECT name, roles, rt_url_limit, static_url_limit, max_file_size FROM pricing WHERE name = ?`,
            [planToInsert]
        );


        let planObj = null;
        if (pricingRows.length > 0) {
            const planRow = pricingRows[0];
            planObj = {
                name: planRow.name,
                roles: JSON.parse(planRow.roles),
                rt_url_limit: planRow.rt_url_limit,
                static_url_limit: planRow.static_url_limit,
                max_file_size: planRow.max_file_size,
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

        const SECRET = process.env.JWT_SECRET;
        const token = jwt.sign(
            { id: result.insertId, email, role: roleToInsert },
            SECRET,
            { expiresIn: '1d' }
        );

        res.status(201).json({
            message: 'Kullanıcı başarıyla eklendi',
            user: { id: result.insertId, email, role: roleToInsert, plan: planObj },
            token
        });

    } catch (error) {
        console.error('Add user error:', error);
        res.status(500).json({ error: 'Bir hata oluştu' });
    }

});

module.exports = router;
