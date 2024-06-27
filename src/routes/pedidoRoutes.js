const express = require('express');
const router = express.Router();
const { getPedidos, getBahias, savePedidoSurtido } = require('../controller/pendientePedidoController');

router.get('/pedidos', getPedidos);
router.get('/bahias', getBahias);
router.post('/surtir', savePedidoSurtido);  // Cambié de PUT a POST para la ruta de guardar el pedido surtido

module.exports = router;
