const express = require('express');
const router = express.Router();
const { getObservacionesPorClientes, getUltimaFechaEmbarque, insertarRutas, obtenerRutasDePaqueteria,
    getFechaYCajasPorPedido, actualizarGuia, getPedidosEmbarque, getTransportistas, getEmpresasTransportistas,
    insertarVisita, guardarDatos, obtenerDatos, eliminarRuta, getOrderStatus, getHistoricoData, getColumnasHistorico, getClientesHistorico,
    obtenerListaDeRutas,
    registrarNuevaRuta,
    borrarRutaPorId,
    asignarPedidoARuta,
} = require('../controller/TrasporteController');

router.post('/clientes/observaciones', getObservacionesPorClientes);

router.get('/pedido/ultimas-fechas-embarque', getUltimaFechaEmbarque);

router.post('/insertarRutas', insertarRutas);

router.get('/rutas', obtenerRutasDePaqueteria);

router.get('/pedido/detalles/:noOrden', getFechaYCajasPorPedido);

router.put('/paqueteria/actualizar-guia/:noOrden', actualizarGuia);

router.get('/embarque/:codigo_ped', getPedidosEmbarque);

router.get('/transportistas', getTransportistas);

router.get('/transportistas/empresas', getEmpresasTransportistas);

router.post('/insertar-visita', insertarVisita);

router.post('/guardar-datos', guardarDatos);

router.get('/obtener-datos', obtenerDatos);

router.delete('/ruta/eliminar/:noOrden', eliminarRuta);

router.get("/historico_clientes", getClientesHistorico);

router.get("/historico_columnas", getColumnasHistorico);

router.get("/historico", getHistoricoData);

router.post('/status', getOrderStatus);


module.exports = router;
