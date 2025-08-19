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
        const { firstname, lastname, email, password, role, inviteToken } = req.body;


        if (!email || !password || !lastname || !firstname) {
            return res.status(400).json({ error: 'Eksik alan var!' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const roleToInsert = typeof role === 'object' ? role.value || 'user' : role || 'user';


        let planToInsert = null;
        let planStartDate = null;
        let planEndDate = null;

        if (inviteToken) {
            const [invRows] = await pool.query(
                `SELECT inviter_user_id FROM invites WHERE token = ? AND status = 'pending' LIMIT 1`,
                [inviteToken]
            );
            if (invRows.length) {
                const inviterId = invRows[0].inviter_user_id;
                const [inviterRows] = await pool.query(
                    `SELECT plan, plan_start_date, plan_end_date FROM users WHERE id = ? LIMIT 1`,
                    [inviterId]
                );
                if (inviterRows.length && inviterRows[0].plan) {
                    planToInsert = inviterRows[0].plan;
                    planStartDate = inviterRows[0].plan_start_date;
                    planEndDate = inviterRows[0].plan_end_date;
                }
            }
        }


        const [result] = await pool.query(
            `INSERT INTO users
        (firstname, lastname, email, password_hash, role, plan, plan_start_date, plan_end_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                firstname, lastname, email, hashedPassword, roleToInsert,
                planToInsert, planStartDate, planEndDate
            ]
        );


        await pool.query(
            `UPDATE invites SET status = 'accepted' WHERE (token = ? OR email = ?) AND status = 'pending'`,
            [inviteToken || null, email]
        );


        let planObj = null;
        if (planToInsert) {
            const [pricingRows] = await pool.query(
                `SELECT name, roles, plan_limit, max_file_size, price FROM pricing WHERE name = ?`,
                [planToInsert]
            );
            if (pricingRows.length) {
                const r = pricingRows[0];
                planObj = {
                    name: r.name,
                    roles: JSON.parse(r.roles),
                    plan_limit: typeof r.plan_limit === 'string' ? JSON.parse(r.plan_limit) : r.plan_limit,
                    max_file_size: r.max_file_size,
                    price: r.price
                };
            }
        }

        const token = jwt.sign(
            { id: result.insertId, email, role: roleToInsert },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.status(201).json({
            id: result.insertId,
            email,
            role: roleToInsert,
            plan: planObj,
            token,
            plan_start_date: planStartDate,
            plan_end_date: planEndDate,
            avatar: null,
            next_plan: null,
            plan_change_date: null,

            customInputValues: {},
        });
    } catch (error) {
        console.error('Add user error:', error);
        res.status(500).json({ error: 'Bir hata oluştu' });
    }
});


module.exports = router;
