// routes/paqueteriraRoutes.js
const express = require('express');
const router = express.Router();
const {
  getPaqueteria,
  updateUsuarioPaqueteria,
  getProgresoValidacion,
  getProductividadEmpaquetadores, // Importar la nueva función del controlador
  getPrintsPorRole,
  obtenerEmbarcadores,
  asignarImpresora,
  liberarImpresora,
} = require('../controller/paqueteriraController');

// Definir las rutas
router.get('/paqueteria', getPaqueteria);
router.put('/paqueteria/:pedidoId/usuario-paqueteria', updateUsuarioPaqueteria);
router.get('/progreso', getProgresoValidacion);
router.get('/productividad', getProductividadEmpaquetadores); // Nueva ruta para obtener la productividad

router.get("/prints/empacadores", getPrintsPorRole);

router.get("/empacadores", obtenerEmbarcadores);

router.put("/impresora/asignar", asignarImpresora);

router.put("/impresora/liberar", liberarImpresora);

module.exports = router;
