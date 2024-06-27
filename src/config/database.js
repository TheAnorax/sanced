// config/database.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'savawms',
    connectTimeout: 60000,
});

module.exports = pool;
