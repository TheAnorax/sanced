// routes/index.js
const express = require('express');
const router = express.Router();
const pedidosRoutes = require('./src/approutes/pedidos');
const bahiasRoutes = require('./src/approutes/bahias');
const pedidosUpdates = require('./src/approutes/pedidosUpdateRoutes'); 
const pedidosEstadoRoutes  = require('./src/approutes/pedidosEstadoRoutes'); 
const pedidosNoSurtidaRoutes = require('./src/approutes/pedidosNoSurtidaRoutes');
const pedidosReabastecimientoRoutes = require('./src/approutes/pedidosReabastecimientoRoutes');
const reabastecimientoRoutes = require('./src/approutes/reabastecimientoRoutes');
const tareaMontaRoutes = require('./src/approutes/tareaMontaRoutes');
const reciboMontaRoutes = require('./src/approutes/reciboMontaRoutes');
const reciboRoutes = require('./src/approutes/reciboRoutes');
const authRoutes = require('./src/approutes/authRoutes');
const embarquesRoutes = require('./src/approutes/embarquesRoutes'); 
const productoRoutes = require('./src/approutes/productoRoutes'); 
const embarqueRoutes = require('./src/approutes/embarqueRoutes'); 
const ubicacionesRoutes = require('./src/approutes/ubicacionesRoutes');
const movimientosRoutes = require('./src/approutes/movimientosRoutes');
const movimientoRoutes = require('./src/approutes/movimientoRoutes');
const inventoryRoutes = require('./src/approutes/inventoryRoutes');  
const productInventoryRoutes = require('./src/approutes/productInventoryRoutes'); 

router.use('/api/pedidos', pedidosRoutes); // Rutas para pedidos
router.use('/bahias', bahiasRoutes); // Rutas para bahias
router.use('/actualizarCantidadSurtida', pedidosUpdates ); // Rutas para bahias
router.use('/api/pedidos/actualizar-estado', pedidosEstadoRoutes);
router.use('/actualizarCantidadNoSurtida', pedidosNoSurtidaRoutes);
router.use('/actualizarSurtidoFaltante', pedidosReabastecimientoRoutes);
router.use('/reabastecimiento', reabastecimientoRoutes);
router.use('/tarea-monta', tareaMontaRoutes); // Rutas para actualizar tarea monta
router.use('/recibomonta', reciboMontaRoutes);
router.use('/actualizarRecibo', reciboRoutes);
router.use('/api/login', authRoutes);
router.use('/embarques', embarquesRoutes);
router.use('/actualizarProducto', productoRoutes);
router.use('/actualizarEmbarque', embarqueRoutes);
router.use('/consultaUbicaciones', ubicacionesRoutes);
router.use('/movimientosUbicacion', movimientosRoutes);
router.use('/realizarMovimiento', movimientoRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/getproductinventory', productInventoryRoutes);




module.exports = router;
