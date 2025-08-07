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
const creditRoutes = require('./routes/credits');
const busServiceRouter = require('./routes/busService');
const http = require('http');
const path = require('path');
const logger = require('./logger');
const multer = require('multer');
require('dotenv').config();
logger.info("JWT_SECRET config test:", process.env.JWT_SECRET);
const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};




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
app.use('/api/busService', busServiceRouter);
app.use(express.static(path.join(__dirname, 'public')));
app.use('/api/plans', priceRoutes);
app.get('/', (req, res) => {
    res.send('Backend Çalışıyor!');
});

const server = http.createServer(app);

server.listen(config.port, () => {
    logger.info(` Server http://localhost:${config.port}`);
});



app.use((err, req, res, next) => {
    console.error('GENEL HATA YAKALANDI:', err.stack || err);
    res.status(500).json({ error: 'Sunucu hatası - detay konsolda' });
});
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/');
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, `avatar_${Date.now()}${ext}`);
    }
});
const upload = multer({ storage });


app.post('/upload', upload.single('avatar'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'Dosya yok' });


    const fileUrl = `/uploads/${req.file.filename}`;

    return res.json({ fileUrl });
});



process.on('exit', () => { logger.info('aaaaaa') });


module.exports = app;
