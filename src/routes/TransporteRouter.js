const express = require("express");
const router = express.Router();
const {
  getObservacionesPorCliente,
  getUltimaFechaEmbarque,
  insertarRutas,
  obtenerRutasDePaqueteria,
  getFechaYCajasPorPedido,
  actualizarGuia,
  getPedidosEmbarque,
} = require("../controller/TrasporteController");

router.get("/clientes/observaciones/:venta", getObservacionesPorCliente);

router.get("/pedido/ultima-fecha-embarque/:pedido", getUltimaFechaEmbarque);

router.post("/insertarRutas", insertarRutas);

router.get("/rutas", obtenerRutasDePaqueteria);

router.get("/pedido/detalles/:noOrden", getFechaYCajasPorPedido);

router.put("/paqueteria/actualizar-guia", actualizarGuia);

router.get("/embarque/:codigo_ped", getPedidosEmbarque);

module.exports = router;
