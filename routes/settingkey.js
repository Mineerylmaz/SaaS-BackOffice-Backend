const express = require('express');

const logger = require('../logger');

const pool = require('../db');
const config = require('../config');
const router = express.Router();




router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM setting_keys');
        res.json(rows);
        logger.info("settings key isteği geldi")
    } catch (err) {
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { key_name, type, description, required } = req.body;
        await pool.query(
            'INSERT INTO setting_keys (key_name, type, description, required) VALUES (?, ?, ?, ?)',
            [key_name, type, description, required ?? false]
        );

        logger.info("settings key isteği eklendi")
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası veya key zaten var' });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM setting_keys WHERE id = ?', [id]);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Silme işlemi başarısız' });
    }
});
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { key_name, type, description, required } = req.body;

    try {
        const [result] = await pool.query(
            `UPDATE setting_keys 
             SET key_name = ?, type = ?, description = ?, required = ?
             WHERE id = ?`,
            [key_name, type, description, required ?? false, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Kayıt bulunamadı' });
        }

        logger.info(`settings key id=${id} güncellendi`);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Güncelleme işlemi başarısız' });
    }
});


module.exports = router; 