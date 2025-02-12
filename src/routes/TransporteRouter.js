const express = require('express');
const router = express.Router();
const { getObservacionesPorCliente, getUltimaFechaEmbarque, insertarRutas, obtenerRutasDePaqueteria,
    getFechaYCajasPorPedido, actualizarGuia, getPedidosEmbarque, getTransportistas, getEmpresasTransportistas, 
    insertarVisita, guardarDatos, obtenerDatos, eliminarRuta, getOrderStatus
} = require('../controller/TrasporteController');

router.get('/clientes/observaciones/:venta', getObservacionesPorCliente);

router.get('/pedido/ultima-fecha-embarque/:pedido', getUltimaFechaEmbarque);

router.post('/insertarRutas', insertarRutas);

router.get('/rutas', obtenerRutasDePaqueteria);

router.get('/pedido/detalles/:noOrden', getFechaYCajasPorPedido);

router.put('/paqueteria/actualizar-guia/:noOrden/:guia', actualizarGuia);

router.get('/embarque/:codigo_ped', getPedidosEmbarque);

router.get('/transportistas', getTransportistas);

router.get('/transportistas/empresas', getEmpresasTransportistas);

router.post('/insertar-visita', insertarVisita);

router.post('/guardar-datos', guardarDatos);

router.get('/obtener-datos', obtenerDatos);

router.delete('/ruta/eliminar/:noOrden', eliminarRuta);  // Esta ruta eliminará la ruta por el parámetro noOrden

// router.get('/status/:orderNumber', getOrderStatus);

module.exports = router;
