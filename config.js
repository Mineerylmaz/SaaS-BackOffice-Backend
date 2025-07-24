require('dotenv').config();

module.exports = {
    db: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'krediler',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    },
    jwtSecret: process.env.JWT_SECRET || 'defaultFallbackSecret',
    port: process.env.PORT || 5000
};
