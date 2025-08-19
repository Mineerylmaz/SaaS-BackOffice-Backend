const request = require('supertest');
const express = require('express');
const inviteRouter = require('../routes/invites');
const pool = require('../db');

jest.mock('../db');

const app = express();
app.use(express.json());
app.use('/api/invites', inviteRouter);


jest.mock('../middleware/authenticateToken', () => (req, res, next) => {
    req.user = { id: 1, role: 'admin' };
    next();
});

jest.mock('../middleware/authorizeRole', () => () => (req, res, next) => next());

describe('Invite API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('POST /api/invites - email veya role eksik', async () => {
        const res = await request(app).post('/api/invites').send({ email: '' });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Email ve rol zorunludur');
    });

    test('POST /api/invites - başarıyla davet gönder', async () => {
        pool.query.mockResolvedValueOnce([[], {}]);
        pool.query.mockResolvedValueOnce([{ insertId: 123 }]);

        const res = await request(app)
            .post('/api/invites')
            .send({ email: 'test@example.com', role: 'user' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.id).toBe(123);
        expect(res.body.token).toBeDefined();
    });

    test('POST /api/invites/accept - geçerli token', async () => {
        const fakeToken = 'fake-token';
        pool.query.mockResolvedValueOnce([[{ status: 'pending', token: fakeToken }]]);
        pool.query.mockResolvedValueOnce([{}]);

        const res = await request(app).post('/api/invites/accept').send({ token: fakeToken });
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
    });

    test('POST /api/invites/reject - zaten kabul edilmiş davet', async () => {
        const fakeToken = 'accepted-token';
        pool.query.mockResolvedValueOnce([[{ status: 'accepted', token: fakeToken }]]);

        const res = await request(app).post('/api/invites/reject').send({ token: fakeToken });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Davet zaten kabul edilmiş, reddedilemez');
    });
});
