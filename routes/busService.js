const express = require('express');
const axios = require('axios');
const router = express.Router();
const { mock_server_parametreler, funcToExternalUrl } = require('../config');
const logger = require('../logger');

async function fetchParamSchema() {
    try {
        const response = await axios.get(mock_server_parametreler);
        return response.data;
    } catch (error) {
        console.error("Parametre şeması alınamadı:", error.message);
        return {};
    }
}


function validateParams(func, query, paramSchema) {
    const schema = paramSchema[func];
    if (!schema) {
        console.log("Şema bulunamadı. Gelen func:", func);
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

        let baseUrl = funcToExternalUrl[func];
        if (!baseUrl) {
            return res.status(400).json({ error: 'Geçersiz func' });
        }


        const schemaParams = schemas[func].params;
        for (const { field } of schemaParams) {
            const val = query[field];
            if (val !== undefined) {
                baseUrl += `&${field}=${encodeURIComponent(val)}`;
            }
        }

        const response = await axios.get(baseUrl);
        console.log("Gelen func:", func);
        console.log("Şemadaki func'lar:", Object.keys(schemas));

        res.json(response.data);

    } catch (err) {
        console.error("Sunucu hatası:", err.message);
        res.status(500).json({ error: 'Sunucu hatası' });
    }
});

module.exports = router;