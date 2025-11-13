const express = require('express');
const router = express.Router();
const { consultarUbicacionEspecifica, consultarUbicacionesConProductos, actualizarCodigo, pickDisponible, AlmaDisponible, obtenerUbicacionesVacias,  getUbiMonta} = require('../appcontrollers/movimientosController');

// Ruta para consultar información de una ubicación específica
router.post('/', consultarUbicacionEspecifica);
router.get('/picking', consultarUbicacionesConProductos);
router.post('/actualizarUbicacion', actualizarCodigo);
router.get('/pickDisponible', pickDisponible )
router.get('/AlmaDisponible', AlmaDisponible )
router.get('/obtenerUbicacionesVacias', obtenerUbicacionesVacias )
router.post("/getUbiMonta", getUbiMonta);

module.exports = router;
