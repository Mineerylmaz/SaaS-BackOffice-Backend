const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');

const router = express.Router();
const authenticateToken = require('../middleware/authenticateToken');
const crypto = require('crypto');
const logger = require('../logger');
function generateApiKey() {
    return crypto.randomBytes(20).toString('hex');
}

router.post('/add-user', async (req, res) => {
    try {
        const { email, password, credits, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ error: 'Eksik alan var!' });
        }

        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Bu email zaten kayıtlı!' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            'INSERT INTO users (email, password_hash, credits, role) VALUES (?, ?, ?, ?)',
            [email, hashedPassword, credits || 0, role]
        );

        res.status(201).json({ message: 'Kullanıcı başarıyla eklendi' });
    } catch (error) {
        console.error('Add user error:', error);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

router.get('/list-users', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT u.id, u.email, u.credits, u.roles, u.plan, u.api_key, u.last_login, u.created_at,
                   us.settings
            FROM users u
            LEFT JOIN user_settings us ON u.id = us.user_id
            WHERE u.deleted = FALSE
        `);

        const users = rows.map(user => ({
            ...user,
            settings: user.settings || {}
        }));

        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Kullanıcılar alınamadı' });
    }
});


router.delete('/delete-user/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        await pool.query('UPDATE users SET deleted = TRUE WHERE id = ?', [userId]);
        res.json({ message: 'Kullanıcı silindi' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Kullanıcı silinemedi' });
    }
});

router.get('/deleted-users', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, email, credits, role, last_login, created_at FROM users WHERE deleted = TRUE');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Silinen kullanıcılar alınamadı' });
    }
});




router.put('/update-user-plan/:id', async (req, res) => {
    const userId = req.params.id;
    const { plan } = req.body;

    logger.info('Update plan için gelen userId:', userId);
    logger.info('Gelen plan:', plan);

    if (!plan) {
        return res.status(400).json({ error: 'Plan bilgisi eksik' });
    }

    try {
        const [rows] = await pool.query('SELECT role, api_key FROM users WHERE id = ?', [userId]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        let api_key = rows[0].api_key;
        if (rows[0].role === 'developer' && !api_key) {
            api_key = generateApiKey();
        }

        const [result] = await pool.query(
            'UPDATE users SET plan = ?, api_key = ? WHERE id = ?',
            [plan, api_key, userId]
        );

        logger.info('UPDATE sonucu:', result);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        res.json({ message: 'Plan ve API anahtarı başarıyla güncellendi', api_key });
    } catch (error) {
        console.error('Plan güncelleme hatası:', error);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});


router.put('/update-user-roles/:id', async (req, res) => {
    const userId = req.params.id;
    const { roles } = req.body;

    if (!roles) {
        return res.status(400).json({ error: 'Roles alanı gerekli' });
    }

    try {
        const rolesJson = JSON.stringify(roles);
        const [result] = await pool.query(
            'UPDATE users SET roles = ? WHERE id = ?',
            [rolesJson, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
        }

        res.json({ message: 'Roller başarıyla güncellendi' });
    } catch (error) {
        console.error('Rol güncelleme hatası:', error);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});




router.put('/change-user-plan/:id', authenticateToken, async (req, res) => {
    const userId = req.params.id;
    const { newPlan } = req.body;

    try {
        const [[user]] = await pool.query('SELECT * FROM users WHERE id = ?', [userId]);
        const now = new Date();
        const nextMonthStartDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

        const planRank = (plan) => ({ Basic: 1, Pro: 2, Premium: 3 }[plan] || 0);


        const nowStr = now.toISOString().split('T')[0];
        const planEndDate = new Date(now);
        planEndDate.setDate(planEndDate.getDate() + 30);
        const planEndDateStr = planEndDate.toISOString().split('T')[0];

        const nextMonth = new Date(now);
        nextMonth.setMonth(now.getMonth() + 1);
        const nextMonthStr = nextMonth.toISOString().split('T')[0];

        if (planRank(newPlan) > planRank(user.plan)) {

            await pool.query(
                'UPDATE users SET plan = ?, plan_start_date = ?, plan_end_date = ?, next_plan = NULL, plan_change_date = NULL WHERE id = ?',
                [newPlan, nowStr, planEndDateStr, userId]
            );
            return res.json({ message: 'Planınız yükseltildi ve hemen aktif oldu.' });

        } else if (planRank(newPlan) < planRank(user.plan)) {

            await pool.query(
                'UPDATE users SET next_plan = ?, plan_change_date = ? WHERE id = ?',
                [newPlan, nextMonthStr, userId]
            );
            return res.json({
                message: "Plan değişikliği bir sonraki ay geçerli olacaktır.",
                planChangeDate: nextMonthStartDate
            });


        } else {
            return res.json({ message: 'Aynı plandasınız, değişiklik yapılmadı' });
        }

    } catch (error) {
        console.error('Plan değiştirme hatası:', error);
        res.status(500).json({ error: 'Plan güncellenemedi' });
    }
});



module.exports = router;