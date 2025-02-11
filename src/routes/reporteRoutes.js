const express = require('express');
const { getPrduSurtido, } = require('../controller/reporteController');

const router = express.Router();

// Rutas del CRUD
router.get('/getPrduSurtido', getPrduSurtido);

module.exports = router;
