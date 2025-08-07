require('dotenv').config();

const funcToExternalUrl = {
    getclosestbusV3: process.env.FUNC_GETCLOSESTBUSV3 || null,
    getroutes: process.env.FUNC_GETROUTES || null,
    getrouteinfonew: process.env.FUNC_GETROUTEINFONEW || null,
};
module.exports = {
    db: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASS || '',
        database: process.env.DB_NAME || 'krediler',
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,


    },




    port: process.env.PORT || 5000,
    mock_server_url: process.env.MOCK_SERVER_URL,
    mock_server_parametreler: process.env.MOCK_SERVER_PARAMETRELER,
    funcToExternalUrl,
};
