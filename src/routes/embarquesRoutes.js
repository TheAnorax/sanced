const express = require('express');
const router = express.Router();
const { getEmbarques, updateUsuarioEmbarques, getProgresoValidacionEmbarque, getProductividadEmbarcadores, resetUsuarioEmbarque,getPrintsPorRole,obtenerEmbarcadores,asignarImpresora } = require('../controller/embarquesController');

router.get('/embarque', getEmbarques);
router.put('/embarque/:pedidoId/usuario-embarque', updateUsuarioEmbarques);
router.get('/embarque/progreso', getProgresoValidacionEmbarque);
router.get('/embarque/productividad', getProductividadEmbarcadores);
router.put('/reset-usuario/:pedidoId', resetUsuarioEmbarque);


router.get("/prints/embarcadores", getPrintsPorRole);

router.get("/embarcadores", obtenerEmbarcadores);

router.put("/impresora/asignar", asignarImpresora);



module.exports = router; 
