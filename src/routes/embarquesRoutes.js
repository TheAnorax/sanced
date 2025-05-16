const express = require('express');
const router = express.Router();
const { getEmbarques, updateUsuarioEmbarques, getProgresoValidacionEmbarque, getProductividadEmbarcadores, resetUsuarioEmbarque } = require('../controller/embarquesController');

router.get('/embarque', getEmbarques);
router.put('/embarque/:pedidoId/usuario-embarque', updateUsuarioEmbarques);
router.get('/embarque/progreso', getProgresoValidacionEmbarque);
router.get('/embarque/productividad', getProductividadEmbarcadores);
router.put('/reset-usuario/:pedidoId', resetUsuarioEmbarque);


module.exports = router; 
