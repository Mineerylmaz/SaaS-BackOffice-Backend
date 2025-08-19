// test/login.test.js
const request = require('supertest');
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

require('dotenv').config();

jest.mock('../db', () => ({
    query: jest.fn(),
}));

const pool = require('../db');
const loginRoute = require('../routes/login');

const app = express();
app.use(express.json());
app.use('/api/login', loginRoute);

describe('POST /api/login/login', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should fail if email or password is missing', async () => {
        const res = await request(app)
            .post('/api/login/login')
            .send({ email: '' });

        expect(res.statusCode).toEqual(400);
        expect(res.body.error).toMatch(/Email ve şifre/);
    });

    it('should fail if user not found', async () => {
        pool.query.mockResolvedValue([[]]);

        const res = await request(app)
            .post('/api/login/login')
            .send({ email: 'notexist@example.com', password: '1234' });

        expect(res.statusCode).toEqual(401);
        expect(res.body.error).toMatch(/Kullanıcı bulunamadı/);
    });

    it('should fail if password is wrong', async () => {

        const fakeUser = {
            id: 1,
            email: 'test@example.com',
            password_hash: await bcrypt.hash('correct_password', 10),
            role: 'user',
            plan: null,
        };

        pool.query.mockResolvedValueOnce([[fakeUser]]);

        const res = await request(app)
            .post('/api/login/login')
            .send({ email: 'test@example.com', password: 'wrong_password' });

        expect(res.statusCode).toEqual(401);
        expect(res.body.error).toMatch(/Şifre yanlış/);
    });

    it('should login successfully with correct credentials', async () => {
        const plainPassword = '123456';
        const hash = await bcrypt.hash(plainPassword, 10);

        const fakeUser = {
            id: 1,
            email: 'test@example.com',
            password_hash: hash,
            role: 'user',
            plan: 'basic',
        };

        pool.query.mockResolvedValueOnce([[fakeUser]]);

        pool.query.mockResolvedValueOnce([{}]);

        const res = await request(app)
            .post('/api/login/login')
            .send({ email: fakeUser.email, password: plainPassword });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('token');
        expect(res.body).toHaveProperty('email', fakeUser.email);
        expect(res.body).toHaveProperty('role', fakeUser.role);
        expect(res.body).toHaveProperty('plan', fakeUser.plan);


        const decoded = jwt.verify(res.body.token, '123');
        expect(decoded).toHaveProperty('email', fakeUser.email);
    });
});
