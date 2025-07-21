// config/database.js
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: '192.168.3.154',
    user: 'root',
    password: '',
    database: 'savawms',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 60000, // Manejo de tiempo de espera de conexión largo
    timezone: '-06:00' // Forzar UTC-6
});

module.exports = pool;
