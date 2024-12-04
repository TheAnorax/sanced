// routes/paqueteriraRoutes.js
const express = require('express');
const router = express.Router();
const {
  getPaqueteria,
  updateUsuarioPaqueteria,
  getProgresoValidacion,
  getProductividadEmpaquetadores, // Importar la nueva función del controlador
} = require('../controller/paqueteriraController');

// Definir las rutas
router.get('/paqueteria', getPaqueteria);
router.put('/paqueteria/:pedidoId/usuario-paqueteria', updateUsuarioPaqueteria);
router.get('/progreso', getProgresoValidacion);
router.get('/productividad', getProductividadEmpaquetadores); // Nueva ruta para obtener la productividad

module.exports = router;
