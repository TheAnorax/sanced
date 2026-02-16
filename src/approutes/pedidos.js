// routes/pedidos.js
const express = require('express');
const router = express.Router();

const { getPedidosData, getPorSurtir, getPorSurtirLista, getResumenUsuarioDelDia, getPedidosPendientes, getDetallePedido} = require('../appcontrollers/pedidosController');

router.get('/', getPedidosData);
router.get('/surtido', getPorSurtir);
router.get('/surtido-detalle', getPorSurtirLista);
router.get('/surtido-kpi', getResumenUsuarioDelDia);
router.get('/pedido-detalle', getPedidosPendientes);
router.get('/a-surtir', getDetallePedido);

module.exports = router;
