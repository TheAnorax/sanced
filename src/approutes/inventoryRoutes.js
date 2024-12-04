const express = require('express');
const router = express.Router();
const { obtenerInventario } = require('../appcontrollers/inventoryController');

// Ruta para obtener el inventario
router.get('/', obtenerInventario);

module.exports = router;
