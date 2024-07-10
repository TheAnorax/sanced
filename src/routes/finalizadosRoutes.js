const express = require('express');
const router = express.Router();
const { getFinalizados } = require('../controller/finalizadosController');

router.get('/pedidos-finalizados', getFinalizados);

module.exports = router;
