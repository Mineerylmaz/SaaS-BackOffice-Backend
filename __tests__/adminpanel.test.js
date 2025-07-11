
const request = require('supertest');
const express = require('express');
const adminRouter = require('../routes/adminpanel');

const app = express();
app.use(express.json());
app.use('/api/admin', adminRouter);

describe('AdminPanel API', () => {
    let createdUserId;

    const testUser = {
        email: 'testuser@example.com',
        password: '123456',
        credits: 100,
        role: 'user',
    };

    afterAll(async () => {

        if (createdUserId) {
            await request(app).delete(`/api/admin/delete-user/${createdUserId}`);
        }
    });

    test('POST /api/admin/add-user - başarılı kullanıcı ekleme', async () => {
        const res = await request(app)
            .post('/api/admin/add-user')
            .send(testUser);

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('message', 'Kullanıcı başarıyla eklendi');
        expect(res.body).toHaveProperty('userId');
        createdUserId = res.body.userId;
    });

    test('POST /api/admin/add-user - eksik alanlarda hata', async () => {
        const res = await request(app)
            .post('/api/admin/add-user')
            .send({ email: 'test2@example.com' });

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Eksik alan var!');
    });

    test('POST /api/admin/add-user - duplicate email hatası', async () => {
        const res = await request(app)
            .post('/api/admin/add-user')
            .send(testUser);

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Bu email zaten kayıtlı!');
    });

    test('GET /api/admin/list-users - kullanıcı listesini alır', async () => {
        const res = await request(app).get('/api/admin/list-users');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('DELETE /api/admin/delete-user/:id - kullanıcı siler', async () => {

        const addRes = await request(app)
            .post('/api/admin/add-user')
            .send({
                email: 'deleteuser@example.com',
                password: '123456',
                role: 'user',
            });
        expect(addRes.statusCode).toBe(201);
        const userIdToDelete = addRes.body.userId;

        const deleteRes = await request(app).delete(`/api/admin/delete-user/${userIdToDelete}`);
        expect(deleteRes.statusCode).toBe(200);
        expect(deleteRes.body).toHaveProperty('message', 'Kullanıcı silindi');
    });

    test('GET /api/admin/deleted-users - silinen kullanıcılar listesi', async () => {
        const res = await request(app).get('/api/admin/deleted-users');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    test('PUT /api/admin/update-user-plan/:id - plan güncelleme', async () => {
        const newPlan = 'premium';
        const res = await request(app)
            .put(`/api/admin/update-user-plan/${createdUserId}`)
            .send({ plan: newPlan });

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('message', 'Plan ve API anahtarı başarıyla güncellendi');
        expect(res.body).toHaveProperty('api_key');
    });

    test('PUT /api/admin/update-user-plan/:id - kullanıcı yoksa 404', async () => {
        const res = await request(app)
            .put(`/api/admin/update-user-plan/99999999`)
            .send({ plan: 'basic' });

        expect(res.statusCode).toBe(404);
        expect(res.body).toHaveProperty('error', 'Kullanıcı bulunamadı');
    });

    test('PUT /api/admin/update-user-plan/:id - plan bilgisi eksik 400', async () => {
        const res = await request(app)
            .put(`/api/admin/update-user-plan/${createdUserId}`)
            .send({});

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('error', 'Plan bilgisi eksik');
    });
});
