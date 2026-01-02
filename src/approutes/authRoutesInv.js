const express = require('express');
const router = express.Router();
const { loginInv } = require('../appcontrollers/authControllerInv');

// Ruta para el inicio de sesión
router.post('/', loginInv);

module.exports = router; 
