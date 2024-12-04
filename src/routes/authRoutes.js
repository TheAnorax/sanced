// routes/authRoutes.js
const express = require('express');
const { login } = require('../controller/authController');
const { addRecibo} = require('../controller/comprasController');
const authenticateToken = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/login', login);

// Rutas protegidas
router.post('/recibo', authenticateToken, addRecibo);

module.exports = router;
