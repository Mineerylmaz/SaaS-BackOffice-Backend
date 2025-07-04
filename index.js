const express = require('express');
const cors = require('cors');

const registerRouter = require('./routes/register');
const config = require('./config');
const loginRouter = require('./routes/login');
const usersRouter = require('./routes/users');
const priceRoutes = require('./routes/pricing');
const adminpanelRoutes = require(`./routes/adminpanel`)



const app = express();

app.use(cors());
app.use(express.json());


app.use('/api/register', registerRouter);
app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);
app.use('/api/pricing', priceRoutes);
app.use('/api/adminpanel', adminpanelRoutes)
app.get('/', (req, res) => {
    res.send('Backend Çalışıyor!');
});

app.listen(config.port, () => {
    console.log(` Server http://localhost:${config.port}`);
});
