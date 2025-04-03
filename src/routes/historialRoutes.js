const express = require('express');
const router = express.Router();
const { getHistorial, almacenamiento, getHistorialPorFecha } = require('../controller/historialController');

// Ruta para obtener el historial de movimientos
router.get('/histo', getHistorial);
router.get('/almacen', almacenamiento);
router.get('/kpi', getHistorialPorFecha);

module.exports = router;
