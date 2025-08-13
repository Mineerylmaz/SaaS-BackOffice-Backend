require('dotenv').config();
let baseUrl = process.env.PIS_BASE_URL;
const basefuncurl = process.env.PIS_BASE_FUNC_URL;

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
    EXTERNAL_SERVICE_CHECK_URL: `${baseUrl}${process.env.EXTERNAL_SERVICE_CHECK_URL}`,
    SERVICE_PARAMETERS_URL: `${baseUrl}${process.env.SERVICE_PARAMETERS_URL}`,
    basefuncurl,

};
