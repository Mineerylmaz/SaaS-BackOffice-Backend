const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

// Router'ı import et
const registerRouter = require('../routes/register');

// Gerçek DB yerine test DB bağlantısı veya test doubles kullanabilirsin
const pool = require('../db');

const app = express();
app.use(bodyParser.json());
app.use('/api/register', registerRouter);

describe('POST /api/register/add-user', () => {
    it('Tüm alanlar eksiksiz olunca kullanıcı eklenir', async () => {
        const res = await request(app)
            .post('/api/register/add-user')
            .send({
                firstname: 'Test',
                lastname: 'User',
                email: `test${Date.now()}@example.com`,
                password: '12345678',
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('message', 'Kullanıcı başarıyla eklendi');
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('user');
        expect(res.body.user).toHaveProperty('id');
        expect(res.body.user).toHaveProperty('email');
        expect(res.body.user).toHaveProperty('role');
    });

    it('Eksik alan varsa 400 döner', async () => {
        const res = await request(app)
            .post('/api/register/add-user')
            .send({
                firstname: 'Test',
                // lastname eksik
                email: 'test@example.com',
                password: '12345678',
            });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Eksik alan var!');
    });
});

describe('GET /api/register/list-users', () => {
    it('Kullanıcı listesi döner', async () => {
        const res = await request(app)
            .get('/api/register/list-users');

        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});
