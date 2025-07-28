const express = require('express');
const cors = require('cors');
const pool = require('./db');
const registerRouter = require('./routes/register');
const config = require('./config');
const loginRouter = require('./routes/login');
const usersRouter = require('./routes/users');
const priceRoutes = require('./routes/pricing');
const adminpanelRoutes = require(`./routes/adminpanel`)
const userSettingsRoutes = require('./routes/userSettings');
const axios = require('axios');
const invitesRoutes = require('./routes/invites');
const settingKeyRoutes = require('./routes/settingkey');
const usertabRouter = require('./routes/user_tab');
const cron = require('node-cron');
require('dotenv').config();
console.log("JWT_SECRET config test:", process.env.JWT_SECRET);  // konsolda görülecek mi?



const cronTask = async () => {
    console.log('[CRON] URL kontrol başlıyor...');

    const [rows] = await pool.query('SELECT user_id, settings FROM user_settings');

    for (const row of rows) {
        console.log(typeof row.settings);
        console.log(row.settings);

        const settingsRaw = row.settings || '{}';
        let settings;

        try {
            if (typeof settingsRaw === 'string') {
                settings = JSON.parse(settingsRaw);
            } else if (typeof settingsRaw === 'object' && settingsRaw !== null) {
                settings = settingsRaw;
            } else {
                settings = {};
            }
        } catch {
            settings = {};
        }

        function isValidUrl(url) {
            try {
                const cleanUrl = url.trim().replace(/^"+|"+$/g, '');
                new URL(cleanUrl);
                return true;
            } catch {
                return false;
            }
        }

        const [deletedRows] = await pool.query(
            'SELECT url, type FROM deleted_urls WHERE user_id = ?',
            [row.user_id]
        );

        const deletedSet = new Set(deletedRows.map(d => d.url + '|' + d.type));

        const allUrls = [
            ...(settings.rt_urls || []).filter(u =>
                isValidUrl(u.url) && !deletedSet.has(u.url.trim().replace(/^"+|"+$/g, '') + '|rt')
            ).map(u => ({ ...u, type: 'rt', url: u.url.trim().replace(/^"+|"+$/g, '') })),
            ...(settings.static_urls || []).filter(u =>
                isValidUrl(u.url) && !deletedSet.has(u.url.trim().replace(/^"+|"+$/g, '') + '|static')
            ).map(u => ({ ...u, type: 'static', url: u.url.trim().replace(/^"+|"+$/g, '') })),
        ];



        for (const urlObj of allUrls) {
            const { url, type, name } = urlObj;  // name de gelsin
            const startTime = Date.now();
            try {
                await axios.get(url, { timeout: 5000 });
                const responseTime = Date.now() - startTime;
                await pool.query(`
          INSERT INTO url_status (user_id, name, url, type, response_time, status, checked_at, error_message)
          VALUES (?, ?, ?, ?, ?, 'success', NOW(), NULL)
        `, [row.user_id, name || null, url, type, responseTime]);
                console.log(`Başarılı: ${url}`);
            } catch (err) {
                const responseTime = Date.now() - startTime;  // hata durumunda da hesapla
                await pool.query(`
          INSERT INTO url_status (user_id, name, url, type, response_time, status, checked_at, error_message)
          VALUES (?, ?, ?, ?, ?, 'error', NOW(), ?)
        `, [row.user_id, name || null, url, type, responseTime, err.message]);

                console.log(`Hata: ${url} → ${err.message}`);
            }
        }

    }

    console.log('[CRON] URL kontrol bitti.');
};

cron.schedule('*/2 * * * *', cronTask);









const app = express();

app.use(cors());
app.use(express.json());


app.use('/api/user_tab', usertabRouter);


app.use('/api/invites', invitesRoutes);

app.use('/api/register', registerRouter);
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);
app.use('/api/pricing', priceRoutes);
app.use('/api/adminpanel', adminpanelRoutes)
app.use('/api/userSettings', userSettingsRoutes);
app.use('/api/setting-key', settingKeyRoutes);


app.use('/api/plans', priceRoutes);
app.get('/', (req, res) => {
    res.send('Backend Çalışıyor!');
});

app.listen(config.port, () => {
    console.log(` Server http://localhost:${config.port}`);
});


// Hata yakalama middleware'i
app.use((err, req, res, next) => {
    console.error('GENEL HATA YAKALANDI:', err.stack || err);
    res.status(500).json({ error: 'Sunucu hatası - detay konsolda' });
});

