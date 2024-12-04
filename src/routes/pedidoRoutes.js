const express = require('express');
const router = express.Router();
const { getPedidos, getBahias, savePedidoSurtido, getUsuarios, mergePedidos } = require('../controller/pendientePedidoController');

router.get('/pedidos', getPedidos);
router.get('/bahias', getBahias);
router.post('/surtir', savePedidoSurtido); 
router.get('/usuarios', getUsuarios);
router.post('/merge', mergePedidos); // Nueva ruta para fusionar pedidos

module.exports = router;
