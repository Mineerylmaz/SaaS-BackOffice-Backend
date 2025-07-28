const request = require('supertest');
const express = require('express');
const pricingRouter = require('../routes/pricing');
const pool = require('../db');

require('dotenv').config();

const app = express();
app.use(express.json());
app.use('/api/pricing', pricingRouter);

jest.mock('../middleware/authenticateToken', () => (req, res, next) => {
    req.user = { id: 1 }; // sahte kullanıcı
    next();
});

jest.mock('../db', () => {
    return {
        query: jest.fn(),
    };
});

describe('Pricing API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('GET /api/pricing returns pricing list', async () => {

        const fakePricing = [
            { id: 1, name: 'Basic', price: 10, features: '[]', rt_url_limit: 5, static_url_limit: 5 },
            { id: 2, name: 'Pro', price: 20, features: '["feature1"]', rt_url_limit: 10, static_url_limit: 10 },
        ];


        pool.query.mockResolvedValueOnce([[fakePricing]]);


        const res = await request(app).get('/api/pricing');

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(fakePricing);
        expect(pool.query).toHaveBeenCalledWith('SELECT * FROM pricing');
    });

    test('PUT /api/pricing updates pricing list', async () => {
        const newPricing = [
            { name: 'Basic', price: 15, features: ['feat1'], rt_url_limit: 6, static_url_limit: 6 },
        ];

        pool.query.mockResolvedValueOnce();
        pool.query.mockResolvedValueOnce();

        const res = await request(app)
            .put('/api/pricing')
            .send(newPricing)
            .set('Content-Type', 'application/json');

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual(newPricing);

        expect(pool.query).toHaveBeenCalledWith('DELETE FROM pricing');

        expect(pool.query).toHaveBeenCalledWith(
            'INSERT INTO pricing (name, price, features, rt_url_limit, static_url_limit) VALUES (?, ?, ?, ?, ?)',
            [
                'Basic',
                15,
                JSON.stringify(['feat1']),
                6,
                6,
            ]
        );
    });

    test('GET /api/pricing returns 500 on DB error', async () => {
        pool.query.mockRejectedValueOnce(new Error('DB error'));

        const res = await request(app).get('/api/pricing');

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ error: 'Veritabanı hatası' });
    });

    test('PUT /api/pricing returns 500 on DB error', async () => {
        pool.query.mockResolvedValueOnce(); // DELETE başarılı
        pool.query.mockRejectedValueOnce(new Error('DB insert error'));

        const res = await request(app)
            .put('/api/pricing')
            .send([{ name: 'Plan1', price: 10, features: [], rt_url_limit: 1, static_url_limit: 1 }])
            .set('Content-Type', 'application/json');

        expect(res.statusCode).toBe(500);
        expect(res.body).toEqual({ error: 'Fiyatlar güncellenemedi' });
    });
});
