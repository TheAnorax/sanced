const express = require('express');
const { getPrduSurtido, getPrduPaqueteria, getPrduEmbarque, getPrduRecibo,getHstorico2024, getTop102024, getTop102025, getTopProductosPorEstado, getPrduSurtidoPorRango, getPrduPaqueteriaPorrango, getHistorico2025 } = require('../controller/reporteController');

const router = express.Router();

// Rutas del CRUD
router.get('/getPrduSurtido', getPrduSurtido);
router.get('/getPrduPaqueteria', getPrduPaqueteria);
router.get('/getPrduEmbarque', getPrduEmbarque);
router.get('/getPrduRecibo', getPrduRecibo);
router.get('/getPrduSurtidoPorRango', getPrduSurtidoPorRango);

router.get('/getPrduPaqueteriaPorrango', getPrduPaqueteriaPorrango);
router.get('/getHstorico2024', getHstorico2024);
router.get('/getTop102024', getTop102024);
router.get('/getTop102025', getTop102025);
router.get('/getTopProductosPorEstado', getTopProductosPorEstado); 
router.get('/getHistorico2025', getHistorico2025);
module.exports = router;
