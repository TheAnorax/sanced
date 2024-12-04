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



module.exports = { getUserByEmail, comparePassword, generateToken };
