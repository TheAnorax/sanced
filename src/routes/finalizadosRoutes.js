const express = require("express");
const router = express.Router();
const {
  getFinalizados,
  getPedidoDetalles,
  getMotivos,
  getClientePorNumero,
  getPedidoDetallesPorMes,
} = require("../controller/finalizadosController");

router.get("/pedidos-finalizados", getFinalizados);
router.get("/pedido/:pedido/:tipo", getPedidoDetalles);
router.get("/pedidos-finalizados/motivos", getMotivos);

router.get("/cliente/:numero", getClientePorNumero);

router.get('/detalles-mes', getPedidoDetallesPorMes);

module.exports = router;
