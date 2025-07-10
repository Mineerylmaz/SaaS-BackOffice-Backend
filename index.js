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

const cron = require('node-cron');

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

        const allUrls = [
            ...(settings.rt_urls || []).map(u => ({ ...u, type: 'rt' })),
            ...(settings.static_urls || []).map(u => ({ ...u, type: 'static' })),
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


app.use('/api/register', registerRouter);
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);
app.use('/api/pricing', priceRoutes);
app.use('/api/adminpanel', adminpanelRoutes)
app.use('/api/userSettings', userSettingsRoutes);


app.get('/', (req, res) => {
    res.send('Backend Çalışıyor!');
});

app.listen(config.port, () => {
    console.log(` Server http://localhost:${config.port}`);
});



