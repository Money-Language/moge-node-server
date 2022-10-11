const mysql = require('mysql2/promise');
const {logger} = require('./winston');
const rds_secret = require('./secret');

// TODO: 본인의 DB 계정 입력
const pool = mysql.createPool({
    host: rds_secret.host,
    user: rds_secret.user,
    port: rds_secret.post,
    password: rds_secret.password,
    database: rds_secret.database
});

module.exports = {
    pool: pool
};