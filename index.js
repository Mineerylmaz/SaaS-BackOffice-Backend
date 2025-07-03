const express = require('express');
const cors = require('cors');
const adminRouter = require('./routes/admin');
const registerRouter = require('./routes/register');
const config = require('./config');
const loginRouter = require('./routes/login');




const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/admin', adminRouter);
app.use('/api/register', registerRouter);
app.use('/api/login', loginRouter);
app.get('/', (req, res) => {
    res.send('Backend Çalışıyor!');
});

app.listen(config.port, () => {
    console.log(` Server http://localhost:${config.port}`);
});
