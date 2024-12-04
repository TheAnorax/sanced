const express = require('express');
const router = express.Router();
const { getEmbarques, updateUsuarioEmbarques, getProgresoValidacionEmbarque, getProductividadEmbarcadores } = require('../controller/embarquesController');

router.get('/embarque', getEmbarques);
router.put('/embarque/:pedidoId/usuario-embarque', updateUsuarioEmbarques);
router.get('/embarque/progreso', getProgresoValidacionEmbarque);
router.get('/embarque/productividad', getProductividadEmbarcadores);

module.exports = router; 
