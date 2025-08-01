const express = require('express');
const axios = require('axios');
const pool = require('../db');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

const funcToExternalUrl = {
    getclosestbusV3: 'https://b64d0781-d2a7-45c5-b0e6-1f05feac3227.mock.pstmn.io',
    getroutes: 'https://6dce4ff4-c9e5-40cb-9253-91d3f463d50b.mock.pstmn.io',
    getrouteinfonew: 'https://3d2fa084-8e5b-40d1-bde5-383b31651801.mock.pstmn.io',

};

router.get('/PassengerInformationServices/Bus', authenticateToken, async (req, res) => {
    const userId = req.user.id;
    const { func, systemid, stopid, lang } = req.query;

    if (!func || !systemid || !stopid || !lang) {
        return res.status(400).json({ error: 'Eksik parametre' });
    }

    try {
        const baseUrl = funcToExternalUrl[func];
        if (!baseUrl) {
            return res.status(400).json({ error: 'Bilinmeyen func parametresi' });
        }

        const externalUrl = `${baseUrl}/PassengerInformationServices/Bus?func=${func}&systemid=${systemid}&stopid=${stopid}&lang=${lang}`;
        const response = await axios.get(externalUrl);

        console.log('DB ye kayıt atılıyor:', userId, externalUrl, JSON.stringify(response.data));
        await pool.query(
            'INSERT INTO api_responses (user_id, url, response_body, created_at) VALUES (?, ?, ?, NOW())',
            [userId, externalUrl, JSON.stringify(response.data)]
        );
        console.log('Kayıt atıldı.');

        return res.json(response.data);

    } catch (error) {
        console.error('Hata:', error.message || error);
        return res.status(500).json({ error: 'Dış servise erişimde hata oluştu.' });
    }
});

module.exports = router;
