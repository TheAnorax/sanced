const express = require('express');
const router = express.Router();
const { getHistorial, almacenamiento, getHistorialPorFecha, getModificaciones } = require('../controller/historialController');

// Ruta para obtener el historial de movimientos
router.get('/histo', getHistorial);
router.get('/almacen', almacenamiento);
router.get('/kpi', getHistorialPorFecha);
router.get('/modificaciones', getModificaciones); 

module.exports = router;
