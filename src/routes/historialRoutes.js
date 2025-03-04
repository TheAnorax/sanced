const express = require('express');
const router = express.Router();
const { getHistorial, almacenamiento } = require('../controller/historialController');

// Ruta para obtener el historial de movimientos
router.get('/histo', getHistorial);
router.get('/almacen', almacenamiento);

module.exports = router;
