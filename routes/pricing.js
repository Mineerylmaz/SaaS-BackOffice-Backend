const express = require('express');
const router = express.Router();

let pricingData = [
    { id: 1, name: 'Free', price: 0, features: ["a", "b"] },
    { id: 2, name: 'Team', price: 99, features: ["a", "b"] },
    { id: 3, name: 'Enterprise', price: 490, features: ["a", "b"] },
];


router.get('/', (req, res) => {
    res.json(pricingData);
});

router.put('/', (req, res) => {
    const newPricing = req.body;
    if (!Array.isArray(newPricing)) {
        return res.status(400).json({ error: 'Geçersiz fiyat formatı' });
    }

    pricingData = newPricing;
    res.json(pricingData);
});

module.exports = router;
