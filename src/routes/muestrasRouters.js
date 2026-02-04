const express = require("express");
const router = express.Router();
const {
  Departamentos,
  buscarProducto,
  guardarSolicitudes,
  obtenerSolicitudes,
  obtenerAutorizadas,
  actualizarSolicitud,
  eliminarSolicitud,
  eliminarProductoDeSolicitud,
  guardarCantidadSurtida,
  marcarSalida,
  obtenerUbicacionesPorCodigo,
  registrarFinEmbarque,
  actualizarContadorPDF,
  obtenerPreciosLista,
  marcarSinMaterial,
  buscarUsuarios
} = require("../controller/muestrasController");

router.get("/departamentos", Departamentos);

router.get("/producto/:codigo", buscarProducto);

// Ruta para obtener solicitudes no autorizadas
router.get("/solicitudes", obtenerSolicitudes);

// Ruta para obtener solicitudes autorizadas
router.get("/autorizadas", obtenerAutorizadas);

// Ruta para guardar solicitudes (puede recibir un array de 1 o más)
router.post("/solicitudes", guardarSolicitudes);

router.patch("/solicitudes/:folio", actualizarSolicitud);

router.delete("/solicitudes/:folio", eliminarSolicitud); //  esta es la nueva ruta

router.delete(
  "/solicitudes/:folio/producto/:codigo",
  eliminarProductoDeSolicitud
);

router.post("/surtido", guardarCantidadSurtida);

router.patch("/salida/:folio", marcarSalida);

router.patch("/embarque/:folio", registrarFinEmbarque);

router.get("/ubicaciones/:codigo", obtenerUbicacionesPorCodigo);

router.put("/contador-pdf/:folio", actualizarContadorPDF);

router.post("/precio-lista", obtenerPreciosLista);

router.post("/sin-material/:folio", marcarSinMaterial);

router.get("/Ussuarios", buscarUsuarios);

module.exports = router;
