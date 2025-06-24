const express = require('express');
const router = express.Router();
const { actualizarProducto, recibirResumenCaja } = require('../appcontrollers/productoController');

// Ruta para actualizar el producto en pedido_embarque
router.put('/', actualizarProducto);
router.post('/resumen-caja', recibirResumenCaja); // ← nueva ruta

module.exports = router;
