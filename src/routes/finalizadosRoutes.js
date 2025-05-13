const express = require('express');
const router = express.Router();
const { getFinalizados, getPedidoDetalles, getMotivos      } = require('../controller/finalizadosController');

router.get('/pedidos-finalizados', getFinalizados);
router.get('/pedido/:pedido/:tipo', getPedidoDetalles);
router.get('/pedidos-finalizados/motivos', getMotivos);



module.exports = router;
