const request = require('supertest');
const express = require('express');
require('dotenv').config(); // .env dosyasını yükler

// Veritabanını sahte hale getiriyoruz
jest.mock('../db', () => ({
    query: jest.fn(),
}));

// Token doğrulamasını sahte hale getiriyoruz
jest.mock('../middleware/authenticateToken', () => (req, res, next) => {
    req.user = { id: 1 }; // sahte kullanıcı
    next();
});

const pool = require('../db');
const settingsRoute = require('../routes/settingkey'); // kendi route dosyanın adı neyse ona göre ayarla

const app = express();
app.use(express.json());
app.use('/api/settingkey', settingsRoute);

describe('Kullanıcı Ayarları Testleri', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('GET /api/settingkey', () => {
        it('ayarları başarıyla getirir', async () => {
            const sahteAyarlar = [
                { key_name: 'tema', value: 'dark' },
                { key_name: 'dil', value: 'tr' },
            ];

            pool.query.mockResolvedValueOnce([sahteAyarlar]);

            const res = await request(app).get('/api/settingkey');

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(sahteAyarlar);
            expect(pool.query).toHaveBeenCalledWith(
                'SELECT * FROM setting_keys'
            );
        });

        it('veritabanı hatası varsa 500 döner', async () => {
            pool.query.mockRejectedValueOnce(new Error('Veritabanı Hatası'));

            const res = await request(app).get('/api/settingkey');

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toMatch(/Sunucu hatası/);
        });
    });

    describe('POST /api/settingkey', () => {
        it('ayarları başarıyla kaydeder', async () => {
            const ayarVerisi = {
                key_name: 'tema',
                type: 'string',
                description: 'Tema seçimi',
            };

            pool.query.mockResolvedValue();

            const res = await request(app)
                .post('/api/settingkey')
                .send(ayarVerisi);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({ success: true });
            expect(pool.query).toHaveBeenCalledWith(
                'INSERT INTO setting_keys (key_name, type, description) VALUES (?, ?, ?)',
                [ayarVerisi.key_name, ayarVerisi.type, ayarVerisi.description]
            );
        });



        it('veritabanı hatası varsa 500 döner (POST)', async () => {
            pool.query.mockRejectedValueOnce(new Error('Veritabanı Hatası'));

            const res = await request(app)
                .post('/api/settingkey')
                .send({
                    settings: [{ key_name: 'tema', value: 'dark' }],
                });

            expect(res.statusCode).toBe(500);
            expect(res.body.error).toMatch(/Sunucu hatası|key zaten var/);
        });
    });
});
