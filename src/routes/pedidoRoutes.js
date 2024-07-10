const express = require('express');
const router = express.Router();
const { getPedidos, getBahias, savePedidoSurtido, getUsuarios } = require('../controller/pendientePedidoController');

router.get('/pedidos', getPedidos);
router.get('/bahias', getBahias);
router.post('/surtir', savePedidoSurtido); 
router.get('/usuarios', getUsuarios);

module.exports = router;
