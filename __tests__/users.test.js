const request = require('supertest');
const express = require('express');
const usersRouter = require('../routes/userSettings');
const pool = require('../db');
const bcrypt = require('bcrypt');
require('dotenv').config(); // .env dosyasını yükler

const app = express();
app.use(express.json());
app.use('/api/users', usersRouter);

jest.mock('../db');
jest.mock('bcrypt');

describe('Users API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('PUT /profile/:userId', () => {
        test('successfully updates email and notifications', async () => {
            pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

            const res = await request(app)
                .put('/api/users/profile/123')
                .send({ email: 'newemail@example.com', notifications: true });

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({ success: true });
            expect(pool.query).toHaveBeenCalledWith(
                'UPDATE users SET email = ?, notifications = ? WHERE id = ?',
                ['newemail@example.com', 1, '123']
            );
        });

        test('handles DB error', async () => {
            pool.query.mockRejectedValueOnce(new Error('DB error'));

            const res = await request(app)
                .put('/api/users/profile/123')
                .send({ email: 'fail@example.com', notifications: false });

            expect(res.statusCode).toBe(500);
            expect(res.body).toEqual({ error: 'Sunucu hatası' });
        });
    });

    describe('PUT /password/:userId', () => {
        test('successfully updates password when old password is correct', async () => {
            pool.query.mockResolvedValueOnce([[{ password_hash: 'hashedOldPass' }]]);
            bcrypt.compare.mockResolvedValue(true);
            bcrypt.hash.mockResolvedValue('hashedNewPass');
            pool.query.mockResolvedValueOnce(); // update query

            const res = await request(app)
                .put('/api/users/password/123')
                .send({ oldPassword: 'oldpass', newPassword: 'newpass' });

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({ success: true });
            expect(bcrypt.compare).toHaveBeenCalledWith('oldpass', 'hashedOldPass');
            expect(bcrypt.hash).toHaveBeenCalledWith('newpass', 10);
            expect(pool.query).toHaveBeenCalledWith(
                'UPDATE users SET password_hash = ? WHERE id = ?',
                ['hashedNewPass', '123']
            );
        });

        test('returns 404 if user not found', async () => {
            pool.query.mockResolvedValueOnce([[]]); // no user found

            const res = await request(app)
                .put('/api/users/password/123')
                .send({ oldPassword: 'oldpass', newPassword: 'newpass' });

            expect(res.statusCode).toBe(404);
            expect(res.body).toEqual({ error: 'Kullanıcı bulunamadı' });
        });

        test('returns 400 if old password is wrong', async () => {
            pool.query.mockResolvedValueOnce([[{ password_hash: 'hashedOldPass' }]]);
            bcrypt.compare.mockResolvedValue(false);

            const res = await request(app)
                .put('/api/users/password/123')
                .send({ oldPassword: 'wrongpass', newPassword: 'newpass' });

            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ error: 'Eski şifre hatalı' });
        });

        test('handles DB error', async () => {
            pool.query.mockRejectedValueOnce(new Error('DB error'));

            const res = await request(app)
                .put('/api/users/password/123')
                .send({ oldPassword: 'oldpass', newPassword: 'newpass' });

            expect(res.statusCode).toBe(500);
            expect(res.body).toEqual({ error: 'Sunucu hatası' });
        });
    });

    describe('GET /settings/:userId', () => {
        test('returns settings and plan', async () => {
            const dbResult = [{
                id: 123,
                plan: 'Pro',
                settings: { theme: 'dark' },
                rt_url_limit: 10,
                static_url_limit: 20,
            }];

            pool.query.mockResolvedValueOnce([dbResult]);

            const res = await request(app).get('/api/users/settings/123');

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({
                settings: { theme: 'dark' },
                plan: {
                    name: 'Pro',
                    rt_url_limit: 10,
                    static_url_limit: 20,
                },
            });
        });

        test('returns empty settings if user not found', async () => {
            pool.query.mockResolvedValueOnce([[]]);

            const res = await request(app).get('/api/users/settings/999');

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({
                settings: {},
                plan: null,
            });
        });

        test('handles DB error', async () => {
            pool.query.mockRejectedValueOnce(new Error('DB error'));

            const res = await request(app).get('/api/users/settings/123');

            expect(res.statusCode).toBe(500);
            expect(res.body).toEqual({ error: 'Sunucu hatası' });
        });
    });

    describe('GET /urlResults/:userId', () => {
        test('returns urlResults with date range filter', async () => {
            const fakeResults = [
                { id: 1, name: 'test', url: 'http://example.com', type: 'GET', responseTime: 100, status: 200, checkedAt: '2023-01-01', errorMessage: null },
            ];
            pool.query.mockResolvedValueOnce([fakeResults]);

            const res = await request(app).get('/api/users/urlResults/123?start=2023-01-01&end=2023-01-31');

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(fakeResults);
        });

        test('handles DB error', async () => {
            pool.query.mockRejectedValueOnce(new Error('DB error'));

            const res = await request(app).get('/api/users/urlResults/123');

            expect(res.statusCode).toBe(500);
            expect(res.body).toEqual({ error: 'Sunucu hatası' });
        });
    });

    describe('POST /urlResults', () => {
        test('inserts new urlResult', async () => {
            pool.query.mockResolvedValueOnce();

            const data = {
                userId: 123,
                name: 'test',
                url: 'http://example.com',
                type: 'GET',
                responseTime: 100,
                status: 200,
                checkedAt: '2023-01-01',
                errorMessage: null,
            };

            const res = await request(app)
                .post('/api/users/urlResults')
                .send(data);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({ success: true });
            expect(pool.query).toHaveBeenCalledWith(
                `INSERT INTO url_status
        (user_id, name, url, type, response_time, status, checked_at, error_message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    123,
                    'test',
                    'http://example.com',
                    'GET',
                    100,
                    200,
                    '2023-01-01',
                    null,
                ]
            );
        });

        test('handles DB error', async () => {
            pool.query.mockRejectedValueOnce(new Error('DB error'));

            const res = await request(app)
                .post('/api/users/urlResults')
                .send({ userId: 123 });

            expect(res.statusCode).toBe(500);
            expect(res.body).toEqual({ error: 'Sunucu hatası' });
        });
    });

    describe('PUT /settings/:userId', () => {
        test('inserts new settings if none exist', async () => {
            pool.query.mockResolvedValueOnce([[]]); // SELECT no rows found
            pool.query.mockResolvedValueOnce([{}]); // INSERT sonucu mock

            const res = await request(app)
                .put('/api/users/settings/123')
                .send({ settings: { theme: 'light' } });

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({ success: true });

            expect(pool.query).toHaveBeenNthCalledWith(1, 'SELECT * FROM user_settings WHERE user_id = ?', ['123']);
            expect(pool.query).toHaveBeenNthCalledWith(2, 'INSERT INTO user_settings (user_id, settings) VALUES (?, ?)', ['123', JSON.stringify({ theme: 'light' })]);
        });

        test('updates settings if exist', async () => {
            pool.query.mockResolvedValueOnce([[{ id: 1, user_id: 123, settings: '{}' }]]); // SELECT found rows
            pool.query.mockResolvedValueOnce([{}]); // UPDATE sonucu mock

            const res = await request(app)
                .put('/api/users/settings/123')
                .send({ settings: { theme: 'dark' } });

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({ success: true });

            expect(pool.query).toHaveBeenNthCalledWith(1, 'SELECT * FROM user_settings WHERE user_id = ?', ['123']);
            expect(pool.query).toHaveBeenNthCalledWith(2, 'UPDATE user_settings SET settings = ? WHERE user_id = ?', [JSON.stringify({ theme: 'dark' }), '123']);
        });

        test('handles DB error', async () => {
            pool.query.mockRejectedValueOnce(new Error('DB error'));

            const res = await request(app)
                .put('/api/users/settings/123')
                .send({ settings: { theme: 'dark' } });

            expect(res.statusCode).toBe(500);
            expect(res.body).toEqual({ error: 'Sunucu hatası' });
        });
    });



})
