const express = require('express');
const router = express.Router();
const { consultarUbicacionEspecifica, consultarUbicacionesConProductos, actualizarCodigo} = require('../appcontrollers/movimientosController');

// Ruta para consultar información de una ubicación específica
router.post('/', consultarUbicacionEspecifica);
router.get('/picking', consultarUbicacionesConProductos);
router.post('/actualizarUbicacion', actualizarCodigo);

module.exports = router;
