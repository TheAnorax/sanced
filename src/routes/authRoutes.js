// routes/authRoutes.js
const express = require('express');
const { login } = require('../controller/authController');
const { addRecibo} = require('../controller/comprasController');
const authenticateToken = require('../middlewares/authMiddleware');
const { sendResetEmail, resetPassword } = require('../controller/authController');

const router = express.Router();

router.post('/login', login);

// Rutas protegidas
router.post('/recibo', authenticateToken, addRecibo);

router.post('/forgot-password', sendResetEmail);
router.post('/reset-password/:token', resetPassword);

module.exports = router;
