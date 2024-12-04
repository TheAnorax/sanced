const express = require('express');
const router = express.Router();
const { getFinalizados, getPedidoDetalles } = require('../controller/finalizadosController');

router.get('/pedidos-finalizados', getFinalizados);
router.get('/pedido/:pedido', getPedidoDetalles);

module.exports = router;
