const express = require('express');
const router = express.Router();
const { getObservacionesPorCliente, getUltimaFechaEmbarque, insertarRutas, obtenerRutasDePaqueteria, getFechaYCajasPorPedido } = require('../controller/TrasporteController');

router.get('/clientes/observaciones/:venta', getObservacionesPorCliente);

router.get('/pedido/ultima-fecha-embarque/:pedido', getUltimaFechaEmbarque);

router.post('/insertarRutas', insertarRutas);

router.get('/rutas', obtenerRutasDePaqueteria);

router.get('/pedido/detalles/:noOrden', getFechaYCajasPorPedido);


module.exports = router;
