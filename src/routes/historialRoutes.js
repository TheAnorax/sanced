const express = require('express');
const router = express.Router();
const { getHistorial } = require('../controller/historialController');

// Ruta para obtener el historial de movimientos
router.get('/histo', getHistorial);

module.exports = router;
