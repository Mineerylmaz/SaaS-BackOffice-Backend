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
const proxyRouter = require('./routes/proxy');

const path = require('path');
const cron = require('node-cron');
const multer = require('multer');

const creditRoutes = require('./routes/credits');



require('dotenv').config();
console.log("JWT_SECRET config test:", process.env.JWT_SECRET);
const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

const cronTask = async () => {
    console.log('[CRON] URL kontrol başlıyor...');

    const [users] = await pool.query(`
        SELECT u.id as user_id, u.plan, us.settings, u.plan_start_date, p.credits
        FROM users u
        LEFT JOIN user_settings us ON u.id = us.user_id
        LEFT JOIN pricing p ON u.plan = p.name
    `);

    for (const user of users) {
        const { user_id, plan, plan_start_date, credits } = user;

        // Log plan ve krediyi kontrol et
        console.log(`Kullanıcı ${user_id} plan: ${plan}, credits: ${credits}`);

        const [[creditUsage]] = await pool.query(
            `SELECT SUM(credit_used) AS used_credits FROM credits_logs 
            WHERE user_id = ? AND timestamp >= ?`,
            [user_id, plan_start_date]
        );

        const usedCredits = creditUsage?.used_credits || 0;

        console.log(`Kullanıcı ${user_id} için kullanılan kredi: ${usedCredits}`);

        if (usedCredits >= credits) {
            console.log(`[SKIP] Kullanıcı ${user_id} için kredi limiti dolmuş (${usedCredits}/${credits})`);
            continue;
        }

        let settings;
        try {
            settings = typeof user.settings === 'string' ? JSON.parse(user.settings) : (user.settings || {});
        } catch {
            settings = {};
        }

        const [deletedRows] = await pool.query(
            'SELECT url, type FROM deleted_urls WHERE user_id = ?',
            [user_id]
        );
        const deletedSet = new Set(deletedRows.map(d => d.url + '|' + d.type));

        const allUrls = [
            ...(settings.rt_urls || [])
                .filter(u => isValidUrl(u.url) && !deletedSet.has(u.url.trim() + '|rt'))
                .map(u => ({ ...u, type: 'rt', url: u.url.trim() })),
            ...(settings.static_urls || [])
                .filter(u => isValidUrl(u.url) && !deletedSet.has(u.url.trim() + '|static'))
                .map(u => ({ ...u, type: 'static', url: u.url.trim() }))
        ];

        for (const urlObj of allUrls) {
            if (usedCredits >= credits) break;

            const { url, type, name } = urlObj;
            const startTime = Date.now();

            try {
                await axios.get(url, { timeout: 5000 });
                const responseTime = Date.now() - startTime;

                await pool.query(`
                    INSERT INTO url_status (user_id, name, url, type, response_time, status, checked_at)
                    VALUES (?, ?, ?, ?, ?, 'success', NOW())
                `, [user_id, name || null, url, type, responseTime]);

            } catch (err) {
                const responseTime = Date.now() - startTime;
                await pool.query(`
                    INSERT INTO url_status (user_id, name, url, type, response_time, status, checked_at, error_message)
                    VALUES (?, ?, ?, ?, ?, 'error', NOW(), ?)
                `, [user_id, name || null, url, type, responseTime, err.message]);
            }

            // kredi logla
            await pool.query(`
                INSERT INTO credits_logs (user_id, url, timestamp, credit_used) 
                VALUES (?, ?, NOW(), ?)
            `, [user_id, url, 1]);

            console.log(`[LOG] Kullanıcı ${user_id} için 1 kredi harcandı.`);
        }
    }

    console.log('[CRON] URL kontrol bitti.');
};

cron.schedule('*/1 * * * *', cronTask);















const app = express();

app.use(cors());
app.use(express.json());


app.use('/api/credits', creditRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

app.use('/api/user_tab', usertabRouter);


app.use('/api/invites', invitesRoutes);

app.use('/api/register', registerRouter);
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);
app.use('/api/pricing', priceRoutes);
app.use('/api/adminpanel', adminpanelRoutes)
app.use('/api/userSettings', userSettingsRoutes);
app.use('/api/setting-key', settingKeyRoutes);
app.use('/api/proxy', proxyRouter);
app.use(express.static(path.join(__dirname, 'public')));
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
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');  // Buraya kaydedilecek
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, `avatar_${Date.now()}${ext}`);
    }
});
const upload = multer({ storage });

// POST /upload ile resim yüklenir
app.post('/upload', upload.single('avatar'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Dosya yok' });

    // Dosya yolu (frontend bunu URL olarak kullanacak)
    const fileUrl = `/uploads/${req.file.filename}`;

    return res.json({ fileUrl });
});

