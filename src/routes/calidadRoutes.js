const express = require('express');
const router = express.Router();
const { getCalidad, autorizarRecibo, enviarCuarentena, enviarSegundas, getProducto, updateProducto, insertarOActualizarProducto, getProductosInactivos} = require('../controller/calidadController');

router.get('/calidad', getCalidad);
router.put('/calidad/autorizar', autorizarRecibo);
router.put('/calidad/cuarentena', enviarCuarentena); 
router.put('/calidad/segundas', enviarSegundas); 
router.post("/calidad/codigo", getProducto);
router.put("/calidad/updatecodigo", updateProducto);
router.post("/calidad/insertarBuscar", insertarOActualizarProducto);
router.get("/calidad/activoinactivo", getProductosInactivos);

module.exports = router;