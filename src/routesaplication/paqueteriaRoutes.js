// routes/paqueteriaRoutes.js
const express = require('express');
const paqueteriaController = require('../controllers/paqueteriaController');

const router = express.Router();

router.get('/embarques', paqueteriaController.getEmbarques);
router.put('/actualizarProducto', paqueteriaController.actualizarProducto);
router.put('/actualizarEmbarque', paqueteriaController.actualizarEmbarque);
router.put('/actualizarBahiaEmbarque', paqueteriaController.actualizarBahiaEmbarque);

module.exports = router;
