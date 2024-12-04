const express = require('express');
const router = express.Router();
const { consultarUbicacionEspecifica } = require('../appcontrollers/movimientosController');

// Ruta para consultar información de una ubicación específica
router.post('/', consultarUbicacionEspecifica);

module.exports = router;
