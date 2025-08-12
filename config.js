require('dotenv').config();
const basefuncurl = process.env.PIS_BASE_FUNC_URL;
const funcToExternalUrl = {
    getclosestbusV3: basefuncurl + process.env.FUNC_GETCLOSESTBUSV3 || null,
    getroutes: basefuncurl + process.env.FUNC_GETROUTES || null,
    getrouteinfonew: basefuncurl + process.env.FUNC_GETROUTEINFONEW || null,
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



    baseurl: process.env.PIS_BASE_URL,
    port: process.env.PORT || 5000,
    EXTERNAL_SERVICE_CHECK_URL: this.baseurl + process.env.EXTERNAL_SERVICE_CHECK_URL,
    SERVICE_PARAMETERS_URL: this.baseurl + process.env.SERVICE_PARAMETERS_URL,
    funcToExternalUrl,
};
