module.exports = {
    development: {
        client: 'mysql2',
        connection: {
            host: 'localhost',
            user: 'root',
            password: 'Mine123.',
            database: 'krediler',
            charset: 'utf8mb4'
        },
        migrations: {
            directory: './migrations'
        }
    }
};
