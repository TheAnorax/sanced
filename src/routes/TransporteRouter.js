const express = require("express");
const router = express.Router();
const multer = require('multer');
const upload = multer();
const { getObservacionesPorClientes, getUltimaFechaEmbarque, insertarRutas, obtenerRutasDePaqueteria, getFechaYCajasPorPedido, actualizarGuia, getPedidosEmbarque, getTransportistas, getEmpresasTransportistas, insertarVisita, guardarDatos,
  obtenerDatos, eliminarRuta, getOrderStatus, getHistoricoData, getColumnasHistorico, getClientesHistorico, actualizarFacturasDesdeExcel, actualizarPorGuia, crearRuta, agregarPedidoARuta, obtenerRutasConPedidos, obtenerRutaPorId, obtenerResumenDelDia,
  getPaqueteriaData, getPedidosDia, getFusionInfo, obtenerRutasParaPDF, actualizarTipoOriginalDesdeExcel, actualizarGuiaCompleta, datosPedidos, enviarCorreoAsignacion, getReferenciasClientes } = require("../controller/TrasporteController");

router.get("/getPaqueteriaData", getPaqueteriaData);

router.get("/getPedidosDia", getPedidosDia);

router.get("/datosPedidos", datosPedidos);

router.post("/clientes/observaciones", getObservacionesPorClientes);

router.get("/pedido/ultimas-fechas-embarque", getUltimaFechaEmbarque);

router.post("/insertarRutas", insertarRutas);

router.get("/rutas", obtenerRutasDePaqueteria);

router.get("/ruta-unica", obtenerRutasParaPDF);

router.get("/pedido/detalles/:noOrden", getFechaYCajasPorPedido);

router.put("/paqueteria/actualizar-guia/:id", actualizarGuia);

router.get("/embarque/:pedido/:tipo", getPedidosEmbarque);


router.get("/transportistas", getTransportistas);

router.get("/transportistas/empresas", getEmpresasTransportistas);

router.post("/insertar-visita", insertarVisita);

router.post("/guardar-datos", guardarDatos);

router.get("/obtener-datos", obtenerDatos);

router.delete("/ruta/eliminar/:noOrden", eliminarRuta);

router.get("/historico_clientes", getClientesHistorico);

router.get("/historico_columnas", getColumnasHistorico);

router.get("/historico", getHistoricoData);

router.post("/status", getOrderStatus);

router.post("/fusion", getFusionInfo);

router.post("/subir-excel", upload.single("archivo"), actualizarFacturasDesdeExcel);

router.post("/actualizar-tipo-original", upload.single("archivo"), actualizarTipoOriginalDesdeExcel);

router.post("/actualizar-por-guia/:guia", actualizarPorGuia);

//para que la vean otras computadoras

router.post("/rutas", crearRuta);

router.post("/rutas/pedidos", agregarPedidoARuta);

router.get("/Rutasconpedido", obtenerRutasConPedidos);

router.get("/rutas/:id", obtenerRutaPorId);

router.get("/resumen-dia", obtenerResumenDelDia);

router.put("/actualizar-guia-completa/:noOrden", actualizarGuiaCompleta);

router.get('/referencias', getReferenciasClientes);

// POST: Enviar correo de asignación (con intentos)
router.post('/enviar-correo-asignacion', upload.single('pdf'), enviarCorreoAsignacion);

// backend local (Node.js + Express)
const axios = require("axios");

router.post("/obtenerPedidos", async (req, res) => {
  try {
    const response = await axios.post("http://santul.verpedidos.com:9011/SantulTest/SANCED");
    res.json(response.data);
  } catch (err) {
    console.error("Error al consultar API remota:", err);
    res.status(500).json({ error: "Error al consultar el servidor remoto" });
  }
});



module.exports = router;
