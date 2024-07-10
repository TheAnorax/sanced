const express = require('express');
const router = express.Router();
const { getSurtidos, updatePedido, updateBahias } = require('../controller/pedidosSurtidosController');

router.get('/pedidos-surtido', getSurtidos);
router.put('/pedidos-surtido/:pedidoId', updatePedido);
router.put('/pedidos-surtido/:pedidoId/bahias', updateBahias);

module.exports = router;
