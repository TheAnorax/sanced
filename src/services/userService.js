// services/userService.js
const pool = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken'); 

const getUserByEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
  return rows[0];
};

const comparePassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

const generateToken = (user) => {
  return jwt.sign({ id_usu: user.id_usu, email: user.email }, 'your_jwt_secret', { expiresIn: '1h' });
};


// modificar el forzar cambio 
const updateUserPassword = async (email, newPassword) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await pool.query(`
    UPDATE usuarios 
    SET password = ?, ultima_modificacion_password = NOW(), forzar_cambio_password = 0 
    WHERE email = ?`, 
    [hashedPassword, email]);
};




module.exports = { getUserByEmail, comparePassword, generateToken, updateUserPassword };
