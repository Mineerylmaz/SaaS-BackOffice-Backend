const express = require('express');
const axios = require('axios');
const router = express.Router();
const { SERVICE_PARAMETERS_URL, basefuncurl } = require('../config');
const logger = require('../logger');

async function fetchParamSchema() {
    try {
        const response = await axios.get(SERVICE_PARAMETERS_URL);
        return response.data;
    } catch (error) {
        console.error("Parametre şeması alınamadı:", error.message);
        return {};
    }
}

function validateParams(func, query, paramSchema) {
    const schema = paramSchema[func];
    if (!schema) {
        logger.info("Şema bulunamadı. Gelen func:", func);
        return `Func "${func}" için şema bulunamadı`;
    }

    for (const { field, req } of schema.params) {
        if (req && !query[field]) {
            return `${field} parametresi zorunlu`;
        }
    }
    return null;
}

router.get('/PassengerInformationServices/Bus', async (req, res) => {
    const { func, ...query } = req.query;

    if (!func) {
        return res.status(400).json({ error: 'func parametresi zorunlu' });
    }

    try {
        const schemas = await fetchParamSchema();

        const error = validateParams(func, query, schemas);
        if (error) return res.status(400).json({ error });

        let baseUrl = `${basefuncurl}/${func}/PassengerInformationServices/Bus`;

        const queryString = new URLSearchParams(query).toString();
        const finalUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;

        const response = await axios.get(finalUrl, { timeout: 5000 });


        logger.info("Giden URL:", finalUrl);
        logger.info("Sunucudan gelen data:", response.data);
        res.json(response.data);

    } catch (err) {
        console.error("Sunucu hatası:", err.message);
        console.error("Hata detayları:", err.code, err.response?.status, err.response?.data);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});


module.exports = router;
