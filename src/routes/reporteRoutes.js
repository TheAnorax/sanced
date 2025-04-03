const express = require('express');
const { getPrduSurtido, getPrduPaqueteria, getPrduEmbarque, getPrduRecibo,getHstorico2024 } = require('../controller/reporteController');

const router = express.Router();

// Rutas del CRUD
router.get('/getPrduSurtido', getPrduSurtido);
router.get('/getPrduPaqueteria', getPrduPaqueteria);
router.get('/getPrduEmbarque', getPrduEmbarque);
router.get('/getPrduRecibo', getPrduRecibo);
router.get('/getHstorico2024', getHstorico2024);
module.exports = router;
